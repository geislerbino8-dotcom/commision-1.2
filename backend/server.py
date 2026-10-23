"""
Mr. Boy SpecialTea — Flask Backend Server

Replaces the PHP backend with Python + Flask + SQLite.
Provides the same API endpoints so the frontend JS works unchanged.

Usage:
    python server.py

Then open: http://localhost:5000
"""

import os
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, send_file, session
from werkzeug.security import generate_password_hash, check_password_hash

# ── App Configuration ──────────────────────────────────────────

app = Flask(__name__, static_folder=None)
app.secret_key = os.environ.get('SECRET_KEY', 'mr_boy_specialtea_secret_key_2026_dev')
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_HTTPONLY'] = True
# Only send the session cookie over HTTPS when explicitly enabled (e.g. in production).
app.config['SESSION_COOKIE_SECURE'] = os.environ.get('SESSION_COOKIE_SECURE', '').lower() in ('1', 'true', 'yes')

# ── CORS Configuration ────────────────────────────────────────
# Requests are same-origin by default (Vercel serves the React build and the
# API from one origin; in dev the Vite server proxies /api to Flask). CORS is
# only relevant when the frontend is hosted separately. Instead of reflecting
# ANY Origin back with credentials (which lets any site make authenticated
# requests), we only allow explicitly configured origins.
_DEFAULT_ORIGINS = (
    'http://localhost:5173,http://127.0.0.1:5173,'
    'http://localhost:5000,http://127.0.0.1:5000'
)


def _allowed_origins():
    """Return the set of origins permitted to make credentialed cross-origin requests."""
    raw = os.environ.get('CORS_ORIGINS', _DEFAULT_ORIGINS)
    return {o.strip().rstrip('/') for o in raw.split(',') if o.strip()}


def _cors_headers(origin):
    """Return CORS response headers only when the origin is allowlisted."""
    if origin and origin.rstrip('/') in _allowed_origins():
        return {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': 'true',
            'Vary': 'Origin',
        }
    return {}


@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin')
    response.headers.update(_cors_headers(origin))
    return response


@app.before_request
def handle_preflight():
    if request.method == 'OPTIONS':
        origin = request.headers.get('Origin')
        cors = _cors_headers(origin)
        response = app.make_default_options_response()
        if cors:
            response.headers.update(cors)
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
        return response
    return None


# ── Auth Helpers (server-side enforcement) ────────────────────
# The React UI hides admin controls, but that is cosmetic. These helpers make
# the SERVER reject unauthorized calls, so the API is safe even if the UI is
# bypassed (e.g. with curl).

def _current_user():
    """Return the authenticated session user dict, or None."""
    return session.get('user')


def _require_login():
    """Return (user, None) if logged in, else (None, error_response)."""
    user = _current_user()
    if not user:
        return None, (jsonify({
            'status': 'error',
            'message': 'You must be logged in to do that.',
            'require_auth': True,
        }), 401)
    return user, None


def _require_admin():
    """Return (user, None) only if the session user is an admin, else an error."""
    user, err = _require_login()
    if err:
        return None, err
    if user.get('role') != 'admin':
        return None, (jsonify({
            'status': 'error',
            'message': 'Administrator access required.',
        }), 403)
    return user, None

BACKEND_DIR  = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
# Static assets (frontend/dist, public/, index.html) live at the repo root.
BASE_DIR     = PROJECT_ROOT
# The SQLite fallback DB lives beside the backend code.
DB_PATH      = os.path.join(BACKEND_DIR, 'database', 'mr_boy.db')

# Auto-load .env configuration if present
env_file = os.path.join(BACKEND_DIR, '.env')
if os.path.exists(env_file):
    try:
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    if k and k not in os.environ:
                        os.environ[k] = v
    except Exception as e:
        print(f"[WARN] Error reading .env: {e}")

# ── MySQL (phpMyAdmin / XAMPP) configuration ──────────────────
# Primary database is local MySQL (MariaDB via XAMPP). Defaults match XAMPP's
# stock setup: root with an empty password on 127.0.0.1:3306.
MYSQL_HOST     = os.environ.get('MYSQL_HOST', '127.0.0.1').strip()
MYSQL_PORT     = int(os.environ.get('MYSQL_PORT', '3306') or '3306')
MYSQL_USER     = os.environ.get('MYSQL_USER', 'root').strip()
MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE', 'mr_boy_db').strip()


# ── MySQL & SQLite Database Adapters ─────────────────────────
# MySQLConnection is a thin sqlite3-compatible wrapper over PyMySQL. Keeping the
# sqlite3 surface (execute/executescript/commit/close + '?' placeholders + rows
# that support both row['col'] and row[0]) means none of the ~36 query call sites
# across the app had to change.

import re
import pymysql


def _split_sql(script):
    """Split a SQL script into individual statements on ';'."""
    return [s.strip() for s in script.split(';') if s.strip()]


def _excluded_to_values(set_clause):
    """Rewrite `col = excluded.col` (SQLite) as `col = VALUES(col)` (MySQL)."""
    parts = []
    for assign in set_clause.split(','):
        assign = assign.strip()
        m = re.match(r'^([A-Za-z_][\w`]*)\s*=\s*excluded\.([A-Za-z_][\w`]*)$', assign, re.IGNORECASE)
        if m:
            parts.append(f"{m.group(1)} = VALUES({m.group(2)})")
        else:
            parts.append(assign)
    return ', '.join(parts)


def _strftime_repl(match):
    """strftime('%m', col) -> DATE_FORMAT(col, '%m'); strftime('%m','now') -> DATE_FORMAT(CURDATE(), '%m')."""
    fmt, col = match.group(1), match.group(2).strip()
    bare = col.strip().strip('\'"')
    target = 'CURDATE()' if bare.lower() == 'now' else col
    return f"DATE_FORMAT({target}, '{fmt}')"


def _to_mysql_sql(sql):
    """Translate the few SQLite-isms this app uses into MySQL equivalents."""
    # Upsert:  ON CONFLICT(col) DO UPDATE SET a = excluded.a, b = CURRENT_TIMESTAMP
    #       -> ON DUPLICATE KEY UPDATE a = VALUES(a), b = CURRENT_TIMESTAMP
    sql = re.sub(
        r'ON CONFLICT\(\s*[A-Za-z_][\w`]*\s*\)\s*DO\s+UPDATE\s+SET\s+(.+?)\s*$',
        lambda m: 'ON DUPLICATE KEY UPDATE ' + _excluded_to_values(m.group(1)),
        sql, flags=re.IGNORECASE | re.DOTALL,
    )
    # DATE('now') -> CURDATE()
    sql = re.sub(r"DATE\(\s*'now'\s*\)", 'CURDATE()', sql, flags=re.IGNORECASE)
    # strftime('%m', x) / strftime('%Y', x) -> DATE_FORMAT(x, '%m' / '%Y')
    sql = re.sub(r"strftime\(\s*'(%[mY])'\s*,\s*('[^']*'|[A-Za-z_]\w*)\s*\)",
                 _strftime_repl, sql, flags=re.IGNORECASE)
    return sql


def _to_pyparam(sql):
    """Convert SQLite '?' placeholders to PyMySQL's '%s', skipping '...' literals."""
    out = []
    in_str = False
    for ch in sql:
        if ch == "'":
            in_str = not in_str
            out.append(ch)
        elif ch == '?' and not in_str:
            out.append('%s')
        else:
            out.append(ch)
    return ''.join(out)


class MySQLRow(dict):
    """Row supporting key access (row['col']) and integer index access (row[0])."""
    def __init__(self, cols, values):
        super().__init__()
        self._cols = list(cols)
        self._values = list(values)
        for col, val in zip(self._cols, self._values):
            self[col] = val

    def __getitem__(self, key):
        if isinstance(key, int):
            return self._values[key]
        return super().__getitem__(key)

    def keys(self):
        return self._cols

    def values(self):
        return self._values


class MySQLCursor:
    def __init__(self, cols=None, rows=None, lastrowid=0, rowcount=0):
        self._cols = cols or []
        self._rows = [MySQLRow(self._cols, r) for r in (rows or [])]
        self._index = 0
        self.lastrowid = lastrowid
        self.rowcount = rowcount

    def fetchone(self):
        if self._index < len(self._rows):
            row = self._rows[self._index]
            self._index += 1
            return row
        return None

    def fetchall(self):
        res = self._rows[self._index:]
        self._index = len(self._rows)
        return res

    def __iter__(self):
        return iter(self.fetchall())


class MySQLConnection:
    """sqlite3-compatible wrapper over a PyMySQL connection."""
    def __init__(self, host, port, user, password, database):
        self._conn = pymysql.connect(
            host=host, port=port, user=user, password=password,
            database=database, charset='utf8mb4', autocommit=False,
            connect_timeout=5, cursorclass=pymysql.cursors.Cursor,
        )

    def execute(self, sql, params=None):
        mysql_sql = _to_mysql_sql(sql)
        if params is not None:
            mysql_sql = _to_pyparam(mysql_sql)
        with self._conn.cursor() as cur:
            affected = cur.execute(mysql_sql, params)
            cols = [d[0] for d in (cur.description or [])]
            rows = cur.fetchall() if cur.description else []
            lastrowid = cur.lastrowid or 0
        return MySQLCursor(cols=cols, rows=rows, lastrowid=lastrowid, rowcount=affected)

    def executescript(self, script):
        last = None
        for stmt in _split_sql(script):
            last = self.execute(stmt)
        return last

    def commit(self):
        self._conn.commit()

    def close(self):
        try:
            self._conn.close()
        except Exception:
            pass


# Tracks whether MySQL is usable. Once a connection fails we remember it and skip
# MySQL for the rest of the process, so every request doesn't pay the failure cost
# (and 500). Set back to True only by restarting the server (e.g. after starting
# XAMPP's MySQL service).
_MYSQL_HEALTHY = True


def get_db():
    """Return a MySQL connection when configured and reachable, else local SQLite."""
    global _MYSQL_HEALTHY
    if MYSQL_DATABASE and _MYSQL_HEALTHY:
        try:
            return MySQLConnection(
                host=MYSQL_HOST, port=MYSQL_PORT, user=MYSQL_USER,
                password=MYSQL_PASSWORD, database=MYSQL_DATABASE,
            )
        except Exception as e:
            print(f"[WARN] MySQL unavailable ({e}); falling back to SQLite at {DB_PATH}")
            _MYSQL_HEALTHY = False

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _using_mysql():
    """True when the primary connection is MySQL (not the SQLite fallback)."""
    return bool(MYSQL_DATABASE) and _MYSQL_HEALTHY


def _mysql_columns(conn, table):
    """Return the column names of a MySQL table via information_schema."""
    rows = conn.execute(
        "SELECT COLUMN_NAME AS name FROM information_schema.columns "
        "WHERE table_schema = DATABASE() AND table_name = ?", (table,)
    ).fetchall()
    return [r['name'] for r in rows]


def _iso(value):
    """Serialise a DB timestamp as 'YYYY-MM-DD HH:MM:SS' (no timezone).

    Flask's default JSON encoder turns datetime objects into RFC-1123 GMT
    strings ("Thu, 22 Oct 2026 13:00:35 GMT"). Because MySQL stores wall-clock
    local time here, that silently shifts every displayed timestamp by the UTC
    offset (8 hours in Manila). Emitting our own plain string keeps the time the
    shop actually recorded, and the frontend's new Date(...) parses it as local.
    """
    if value is None:
        return None
    if hasattr(value, 'strftime'):
        return value.strftime('%Y-%m-%d %H:%M:%S')
    # Already a string from the driver - normalise "YYYY-MM-DDTHH:MM:SS".
    return str(value).replace('T', ' ')[:19]


def init_db():
    """Create tables if they don't exist and seed default admin."""
    if _using_mysql():
        mysql_ddl = '''
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                fullname VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'customer',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME NULL DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                customer_name VARCHAR(255) NOT NULL,
                customer_username VARCHAR(255) NULL,
                customer_email VARCHAR(255) NULL,
                order_details TEXT NOT NULL,
                total_price DOUBLE NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS contact_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                contact VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                is_read INT DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS product_availability (
                product_id VARCHAR(255) PRIMARY KEY,
                is_available INT DEFAULT 1,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        '''
        conn = get_db()
        conn.executescript(mysql_ddl)

        # Migration for existing orders table
        order_cols = _mysql_columns(conn, 'orders')
        if 'user_id' not in order_cols:
            conn.execute("ALTER TABLE orders ADD COLUMN user_id INT NULL")
        if 'customer_username' not in order_cols:
            conn.execute("ALTER TABLE orders ADD COLUMN customer_username VARCHAR(255) NULL")
        if 'customer_email' not in order_cols:
            conn.execute("ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255) NULL")
        if 'status' not in order_cols:
            conn.execute("ALTER TABLE orders ADD COLUMN status VARCHAR(50) DEFAULT 'pending'")

        # Migration for contact_messages table (is_read column)
        contact_cols = _mysql_columns(conn, 'contact_messages')
        if 'is_read' not in contact_cols:
            conn.execute("ALTER TABLE contact_messages ADD COLUMN is_read INT DEFAULT 0")

        # Migration for users table (last_login column — powers the admin Users tab)
        user_cols = _mysql_columns(conn, 'users')
        if 'last_login' not in user_cols:
            conn.execute("ALTER TABLE users ADD COLUMN last_login DATETIME NULL DEFAULT NULL")
    else:
        os.makedirs(os.path.join(BACKEND_DIR, 'database'), exist_ok=True)
        conn = get_db()
        conn.executescript('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                fullname TEXT NOT NULL,
                role TEXT DEFAULT 'customer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL DEFAULT NULL
            );

            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                customer_name TEXT NOT NULL,
                customer_username TEXT,
                customer_email TEXT,
                order_details TEXT NOT NULL,
                total_price REAL NOT NULL,
                status TEXT DEFAULT 'pending',
                order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS contact_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                contact TEXT NOT NULL,
                message TEXT NOT NULL,
                is_read INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS product_availability (
                product_id TEXT PRIMARY KEY,
                is_available INTEGER DEFAULT 1,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ''')

        # Migration for existing orders table
        order_cols = [col[1] for col in conn.execute("PRAGMA table_info(orders)").fetchall()]
        if 'user_id' not in order_cols:
            conn.execute("ALTER TABLE orders ADD COLUMN user_id INTEGER")
        if 'customer_username' not in order_cols:
            conn.execute("ALTER TABLE orders ADD COLUMN customer_username TEXT")
        if 'customer_email' not in order_cols:
            conn.execute("ALTER TABLE orders ADD COLUMN customer_email TEXT")
        if 'status' not in order_cols:
            conn.execute("ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending'")

        # Migration for contact_messages table (is_read column)
        contact_cols = [col[1] for col in conn.execute("PRAGMA table_info(contact_messages)").fetchall()]
        if 'is_read' not in contact_cols:
            conn.execute("ALTER TABLE contact_messages ADD COLUMN is_read INTEGER DEFAULT 0")

        # Migration for users table (last_login column — powers the admin Users tab)
        user_cols = [col[1] for col in conn.execute("PRAGMA table_info(users)").fetchall()]
        if 'last_login' not in user_cols:
            conn.execute("ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL DEFAULT NULL")

    # Seed default admin if missing
    admin = conn.execute("SELECT id FROM users WHERE username = 'admin'").fetchone()
    if not admin:
        hashed_pw = generate_password_hash('admin123')
        conn.execute(
            "INSERT INTO users (username, email, password, fullname, role) VALUES (?, ?, ?, ?, ?)",
            ('admin', 'admin@mrboyspecialtea.com', hashed_pw, 'System Administrator', 'admin')
        )
        print("[OK] Seeded default admin account (username: admin / password: admin123)")

    conn.commit()
    conn.close()

    if _using_mysql():
        print(f"[OK] Connected to MySQL: {MYSQL_USER}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}")
    else:
        print(f"[OK] Database ready at local SQLite: {DB_PATH}")


# ── Static File Serving ───────────────────────────────────────

DIST_DIR = os.path.join(BASE_DIR, 'frontend', 'dist')

@app.route('/')
def index():
    """Serve modern React + shadcn frontend if built, or fallback to root index.html."""
    if os.path.exists(os.path.join(DIST_DIR, 'index.html')):
        response = send_file(os.path.join(DIST_DIR, 'index.html'))
    else:
        response = send_file(os.path.join(BASE_DIR, 'index.html'))
    # The HTML shell references content-hashed bundles, so it must always be
    # revalidated — otherwise browsers (and the service worker's navigation
    # fallback) keep serving an old build after a redeploy.
    response.headers['Cache-Control'] = 'no-cache'
    return response


@app.route('/assets/<path:filename>')
def serve_dist_assets(filename):
    """Serve compiled Vite React assets."""
    return send_from_directory(os.path.join(DIST_DIR, 'assets'), filename)


@app.route('/manifest.webmanifest')
def serve_pwa_manifest():
    """Serve the installable app manifest from the frontend build."""
    return send_from_directory(DIST_DIR, 'manifest.webmanifest')


@app.route('/service-worker.js')
def serve_service_worker():
    """Serve the service worker from the site root so it can control the app."""
    response = send_from_directory(DIST_DIR, 'service-worker.js')
    response.headers['Cache-Control'] = 'no-cache'
    return response


@app.route('/public/<path:filename>')
def serve_public(filename):
    """Serve static media assets from public folder."""
    return send_from_directory(os.path.join(BASE_DIR, 'public'), filename)


@app.route('/images/<path:filename>')
def serve_images(filename):
    """Serve product and branding images."""
    for folder in [
        os.path.join(BASE_DIR, 'frontend', 'public', 'images'),
        os.path.join(BASE_DIR, 'public', 'images'),
        os.path.join(DIST_DIR, 'images'),
    ]:
        if os.path.exists(os.path.join(folder, filename)):
            return send_from_directory(folder, filename)
    return ('Image not found', 404)


# ── Health Check ──────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
@app.route('/health', methods=['GET'])
def health():
    using_mysql = _using_mysql()
    return jsonify({
        'status': 'ok',
        'database': 'mysql' if using_mysql else 'sqlite',
        'mysql_host': f"{MYSQL_HOST}:{MYSQL_PORT}" if using_mysql else None,
        'mysql_database': MYSQL_DATABASE if using_mysql else None,
        'cloud_connected': using_mysql,
        'timestamp': datetime.utcnow().isoformat()
    })


# ── API: Auth (Register / Login / Logout / Current User) ───────

@app.route('/api/register.php', methods=['POST'])
@app.route('/api/register', methods=['POST'])
@app.route('/register.php', methods=['POST'])
@app.route('/register', methods=['POST'])
def register():
    """Register a new customer account."""
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': 'No data received.'}), 400

    username = data.get('username', '').strip()
    fullname = data.get('fullname', '').strip()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not username or not fullname or not email or not password:
        return jsonify({'status': 'error', 'message': 'All fields are required.'}), 400

    if len(password) < 6:
        return jsonify({'status': 'error', 'message': 'Password must be at least 6 characters.'}), 400

    if '@' not in email or '.' not in email:
        return jsonify({'status': 'error', 'message': 'Please enter a valid email address.'}), 400

    conn = get_db()
    existing = conn.execute(
        "SELECT id FROM users WHERE username = ? OR email = ?",
        (username, email)
    ).fetchone()

    if existing:
        conn.close()
        return jsonify({'status': 'error', 'message': 'Username or Email is already taken.'}), 400

    hashed_pw = generate_password_hash(password)
    cur = conn.execute(
        "INSERT INTO users (username, email, password, fullname, role) VALUES (?, ?, ?, ?, 'customer')",
        (username, email, hashed_pw, fullname)
    )
    user_id = cur.lastrowid
    conn.commit()
    conn.close()

    user_data = {
        'id': user_id,
        'username': username,
        'email': email,
        'fullname': fullname,
        'role': 'customer'
    }
    session['user'] = user_data

    return jsonify({
        'status': 'success',
        'message': 'Registration successful! Welcome to Mr. Boy SpecialTea.',
        'user': user_data
    })


@app.route('/api/login.php', methods=['POST'])
@app.route('/api/login', methods=['POST'])
@app.route('/login.php', methods=['POST'])
@app.route('/login', methods=['POST'])
def login():
    """Login with username or email."""
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': 'No data received.'}), 400

    login_identifier = data.get('username', '').strip()
    password         = data.get('password', '')

    if not login_identifier or not password:
        return jsonify({'status': 'error', 'message': 'Username/Email and Password are required.'}), 400

    conn = get_db()
    user = conn.execute(
        "SELECT id, username, email, password, fullname, role FROM users WHERE username = ? OR email = ?",
        (login_identifier, login_identifier.lower())
    ).fetchone()

    if not user or not check_password_hash(user['password'], password):
        conn.close()
        return jsonify({'status': 'error', 'message': 'Invalid username/email or password.'}), 401

    # Stamp the successful sign-in so the admin Users tab can show "last login".
    # A failure here must never block someone from logging in.
    try:
        conn.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", (user['id'],))
        conn.commit()
    except Exception:
        try:
            conn.rollback()
        except Exception:
            pass

    conn.close()

    user_data = {
        'id': user['id'],
        'username': user['username'],
        'email': user['email'],
        'fullname': user['fullname'],
        'role': user['role']
    }
    session['user'] = user_data

    return jsonify({
        'status': 'success',
        'message': f'Welcome back, {user["fullname"]}!',
        'user': user_data
    })


@app.route('/api/logout.php', methods=['POST', 'GET'])
@app.route('/api/logout', methods=['POST', 'GET'])
@app.route('/logout.php', methods=['POST', 'GET'])
@app.route('/logout', methods=['POST', 'GET'])
def logout():
    """Log out current user."""
    session.pop('user', None)
    return jsonify({'status': 'success', 'message': 'Logged out successfully.'})


@app.route('/api/current_user.php', methods=['GET'])
@app.route('/api/current_user', methods=['GET'])
@app.route('/current_user.php', methods=['GET'])
@app.route('/current_user', methods=['GET'])
def current_user():
    """Get current session user."""
    user = session.get('user')
    if user:
        return jsonify({'logged_in': True, 'user': user})
    return jsonify({'logged_in': False, 'user': None})


@app.route('/api/change_password.php', methods=['POST'])
@app.route('/api/change_password', methods=['POST'])
@app.route('/change_password.php', methods=['POST'])
@app.route('/change_password', methods=['POST'])
def change_password():
    """Change user password after verifying current password."""
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': 'No data received.'}), 400

    # Identity comes only from the authenticated session (never a client-supplied user_id).
    session_user = session.get('user')
    user_id = session_user.get('id') if session_user else None
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not user_id:
        return jsonify({'status': 'error', 'message': 'You must be logged in to change your password.'}), 401

    if not current_password or not new_password:
        return jsonify({'status': 'error', 'message': 'Both current and new password are required.'}), 400

    if len(new_password) < 6:
        return jsonify({'status': 'error', 'message': 'New password must be at least 6 characters long.'}), 400

    conn = get_db()
    user = conn.execute("SELECT id, password, fullname, username FROM users WHERE id = ?", (user_id,)).fetchone()

    if not user:
        conn.close()
        return jsonify({'status': 'error', 'message': 'User account not found.'}), 404

    if not check_password_hash(user['password'], current_password):
        conn.close()
        return jsonify({'status': 'error', 'message': 'Current password is incorrect. Please try again.'}), 400

    if current_password == new_password:
        conn.close()
        return jsonify({'status': 'error', 'message': 'New password cannot be the same as your old password.'}), 400

    hashed_pw = generate_password_hash(new_password)
    conn.execute("UPDATE users SET password = ? WHERE id = ?", (hashed_pw, user_id))
    conn.commit()
    conn.close()

    return jsonify({
        'status': 'success',
        'message': 'Password changed successfully! You can now use your new password.'
    })


# ── API: Orders ───────────────────────────────────────────────

# ── Server-side price catalog (mirrors frontend/src/data/menu.ts) ────────
# Order totals are recomputed on the server so a tampered client cannot submit
# an arbitrary total_price. Keep in sync with the React menu data.
_STANDARD_PRICES = {'16oz': 29.0, '22oz': 39.0}   # drinks, fruit tea, frappe, coffee
_HOT_PRICES      = {'12oz': 35.0}                  # hot cups
_SNACK_PRICES    = {'medium': 29.0, 'large': 49.0} # french fries
_ADDON_PRICES    = {'pearl': 9.0}


def _size_price(size):
    """Look up the unit price for a size label across all menu categories."""
    return _STANDARD_PRICES.get(size) or _HOT_PRICES.get(size) or _SNACK_PRICES.get(size)


def _build_order_from_items(items):
    """Recompute the cart total AND the display string from structured items.

    Returns (total, details, error). total/details are None when error is set.
    Regenerating the details string guarantees the stored receipt always matches
    the amount actually charged, even if a client tampers with either field.
    """
    total = 0.0
    parts = []

    for raw in items:
        if not isinstance(raw, dict):
            return None, None, 'Invalid cart item payload.'
        name = str(raw.get('item', '')).strip()
        size = str(raw.get('size', '')).strip()
        if not name or not size:
            return None, None, 'Each cart item needs a name and size.'

        unit = _size_price(size.lower())
        if unit is None:
            return None, None, f'Unknown size "{size}" for "{name}".'

        addons = raw.get('addons') or []
        if not isinstance(addons, list):
            return None, None, 'Invalid add-on payload.'

        addon_total = 0.0
        addon_labels = []
        for a in addons:
            a_name = str(a.get('name', '')).strip().lower() if isinstance(a, dict) else ''
            if a_name not in _ADDON_PRICES:
                return None, None, f'Unknown add-on "{a_name or "empty"}".'
            addon_total += _ADDON_PRICES[a_name]
            addon_labels.append(f'+ {a.get("name", "").strip()}')

        total += unit + addon_total
        line = f'{name} ({size})'
        if addon_labels:
            line += ' ' + ' '.join(addon_labels)
        parts.append(line)

    if not parts:
        return None, None, 'Cart is empty or missing order details.'

    return round(total, 2), ', '.join(parts), None


@app.route('/api/submit_order.php', methods=['POST'])
@app.route('/api/submit_order', methods=['POST'])
@app.route('/submit_order.php', methods=['POST'])
@app.route('/submit_order', methods=['POST'])
def submit_order():
    """Create a new order bound strictly to authenticated user credentials."""
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': 'No data received.'}), 400

    # Identity comes ONLY from the authenticated session — never from a
    # client-supplied user_id (that would let anyone place orders as someone else).
    session_user = session.get('user')

    conn = get_db()

    authenticated_user = None
    if session_user and session_user.get('id'):
        user_row = conn.execute("SELECT id, fullname, username, email, role FROM users WHERE id = ?", (session_user['id'],)).fetchone()
        if user_row:
            authenticated_user = dict(user_row)

    if not authenticated_user:
        conn.close()
        return jsonify({
            'status': 'error',
            'message': 'You must be logged in to submit an order.',
            'require_auth': True
        }), 401

    # Admins manage the shop, they don't buy from it. Enforced HERE rather than
    # only in the UI, so an admin session cannot place an order by calling the
    # API directly either.
    if authenticated_user.get('role') == 'admin':
        conn.close()
        return jsonify({
            'status': 'error',
            'message': 'Administrator accounts cannot place orders. Sign in with a customer account to order.',
            'admin_cannot_order': True,
        }), 403

    # Bind order to authenticated user credentials
    bound_user_id = authenticated_user['id']
    customer_name = authenticated_user['fullname']
    customer_username = authenticated_user['username']
    customer_email = authenticated_user['email']

    # Preferred path: the client sends the structured cart, and the server
    # recomputes both the total and the receipt text. This makes the stored
    # amount immune to a tampered total_price field.
    items = data.get('items')
    computed_total = None
    computed_details = None
    if isinstance(items, list) and items:
        computed_total, computed_details, err = _build_order_from_items(items)
        if err:
            conn.close()
            return jsonify({'status': 'error', 'message': err}), 400

    order_details = (computed_details if computed_details is not None
                     else data.get('order_details', '').strip())

    # Legacy fallback: coerce total_price defensively (a non-numeric value used
    # to raise an unhandled TypeError and return a bare HTTP 500).
    if computed_total is not None:
        total_price = computed_total
    else:
        try:
            total_price = float(data.get('total_price', 0) or 0)
        except (TypeError, ValueError):
            conn.close()
            return jsonify({'status': 'error', 'message': 'Invalid total price.'}), 400

    if not order_details or total_price <= 0:
        conn.close()
        return jsonify({'status': 'error', 'message': 'Cart is empty or missing order details.'}), 400

    cursor = conn.execute(
        '''INSERT INTO orders (user_id, customer_name, customer_username, customer_email, order_details, total_price, status)
           VALUES (?, ?, ?, ?, ?, ?, 'pending')''',
        (bound_user_id, customer_name, customer_username, customer_email, order_details, total_price)
    )
    new_order_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        'status': 'success',
        'message': f'Order #{new_order_id} successfully bound to account @{customer_username}!',
        'order_id': new_order_id
    })


@app.route('/api/fetch_orders.php', methods=['GET'])
@app.route('/api/fetch_orders', methods=['GET'])
@app.route('/fetch_orders.php', methods=['GET'])
@app.route('/fetch_orders', methods=['GET'])
def fetch_orders():
    """Fetch orders.

    - Customer (no user_id / own user_id): only their own orders.
    - Admin: all orders, or any user's via user_id.
    """
    user, err = _require_login()
    if err:
        return err

    is_admin = user.get('role') == 'admin'
    requested_user_id = request.args.get('user_id')

    conn = get_db()

    if requested_user_id:
        try:
            requested_user_id = int(requested_user_id)
        except (TypeError, ValueError):
            conn.close()
            return jsonify({'status': 'error', 'message': 'Invalid user ID.'}), 400

        # A non-admin may only ever fetch their own orders (prevents IDOR).
        if not is_admin and requested_user_id != int(user['id']):
            conn.close()
            return jsonify({'status': 'error', 'message': 'You may only view your own orders.'}), 403

        rows = conn.execute(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC', 
            (requested_user_id,)
        ).fetchall()
    else:
        # Fetching ALL orders is an admin function.
        if not is_admin:
            conn.close()
            return jsonify({'status': 'error', 'message': 'Administrator access required.'}), 403

        rows = conn.execute('SELECT * FROM orders ORDER BY order_date DESC').fetchall()
    
    conn.close()

    orders = []
    for row in rows:
        orders.append({
            'id': row['id'],
            'user_id': row['user_id'] if 'user_id' in row.keys() else None,
            'customer_name': row['customer_name'],
            'customer_username': row['customer_username'] if 'customer_username' in row.keys() else None,
            'customer_email': row['customer_email'] if 'customer_email' in row.keys() else None,
            'order_details': row['order_details'],
            'total_price': row['total_price'],
            'status': row['status'] if 'status' in row.keys() else 'pending',
            'order_date': _iso(row['order_date']),
        })

    return jsonify(orders)


@app.route('/api/update_order_status.php', methods=['POST'])
@app.route('/api/update_order_status', methods=['POST'])
@app.route('/update_order_status.php', methods=['POST'])
@app.route('/update_order_status', methods=['POST'])
def update_order_status():
    """Update order status (pending / completed). Admin only."""
    admin, err = _require_admin()
    if err:
        return err

    data = request.get_json() or {}
    order_id = data.get('id', 0)
    status = data.get('status', 'completed')

    if not order_id:
        return jsonify({'status': 'error', 'message': 'Invalid order ID.'}), 400

    # Only allow the known order lifecycle states. Without this check a client
    # could write arbitrary values that break the analytics status grouping and
    # the admin status filter.
    allowed_statuses = ('pending', 'received', 'completed', 'cancelled')
    if status not in allowed_statuses:
        return jsonify({
            'status': 'error',
            'message': f'Invalid status "{status}". Allowed: {", ".join(allowed_statuses)}.'
        }), 400

    conn = get_db()
    cur = conn.execute('UPDATE orders SET status = ? WHERE id = ?', (status, order_id))
    conn.commit()
    updated = cur.rowcount
    conn.close()

    if not updated:
        return jsonify({'status': 'error', 'message': f'Order #{order_id} not found.'}), 404

    return jsonify({'status': 'success', 'message': f'Order #{order_id} marked as {status}.'})


@app.route('/api/delete_order.php', methods=['POST'])
@app.route('/api/delete_order', methods=['POST'])
@app.route('/delete_order.php', methods=['POST'])
@app.route('/delete_order', methods=['POST'])
def delete_order():
    """Delete a single order by ID. Admin only."""
    admin, err = _require_admin()
    if err:
        return err

    data = request.get_json()
    order_id = data.get('id', 0) if data else 0

    if not order_id:
        return jsonify({'status': 'error', 'message': 'Invalid order ID.'}), 400

    conn = get_db()
    conn.execute('DELETE FROM orders WHERE id = ?', (order_id,))
    conn.commit()
    conn.close()

    return jsonify({'status': 'success', 'message': 'Order deleted.'})


@app.route('/api/clear_orders.php', methods=['POST'])
@app.route('/api/clear_orders', methods=['POST'])
@app.route('/clear_orders.php', methods=['POST'])
@app.route('/clear_orders', methods=['POST'])
def clear_orders():
    """Delete all orders. Admin only."""
    admin, err = _require_admin()
    if err:
        return err

    conn = get_db()
    conn.execute('DELETE FROM orders')
    conn.commit()
    conn.close()

    return jsonify({'status': 'success', 'message': 'All orders cleared.'})


# ── API: Contact ──────────────────────────────────────────────

# ── API: Users (admin) ────────────────────────────────────────────

@app.route('/api/fetch_users.php', methods=['GET'])
@app.route('/api/fetch_users', methods=['GET'])
@app.route('/fetch_users.php', methods=['GET'])
@app.route('/fetch_users', methods=['GET'])
def fetch_users():
    """List every registered account with sign-in and spend history. Admin only.

    Powers the admin "Users" tab: who has an account, when they last signed in,
    and how much they have actually ordered. Read-only by design.
    """
    admin, err = _require_admin()
    if err:
        return err

    conn = get_db()

    rows = conn.execute(
        "SELECT id, username, fullname, email, role, created_at, last_login "
        "FROM users ORDER BY created_at DESC"
    ).fetchall()

    # Order activity per customer (cancelled orders excluded, matching analytics).
    stats = {}
    for row in conn.execute(
        "SELECT user_id, COUNT(*) AS orders, COALESCE(SUM(total_price), 0) AS spent "
        "FROM orders WHERE status != 'cancelled' GROUP BY user_id"
    ).fetchall():
        stats[row['user_id']] = {
            'order_count': int(row['orders']),
            'total_spent': float(row['spent']),
        }

    conn.close()

    users = []
    for row in rows:
        u = dict(row)
        s = stats.get(u['id'], {'order_count': 0, 'total_spent': 0.0})
        last_login = u.get('last_login')
        users.append({
            'id': u['id'],
            'username': u['username'],
            'fullname': u['fullname'],
            'email': u['email'],
            'role': u['role'] or 'customer',
            'is_admin': (u['role'] == 'admin'),
            'created_at': _iso(u['created_at']),
            'last_login': _iso(last_login),
            'has_signed_in': last_login is not None,
            'order_count': s['order_count'],
            'total_spent': s['total_spent'],
        })

    return jsonify(users)


@app.route('/api/save_contact.php', methods=['POST'])
@app.route('/api/save_contact', methods=['POST'])
@app.route('/save_contact.php', methods=['POST'])
@app.route('/save_contact', methods=['POST'])
def save_contact():
    """Save a contact form message (supports both JSON and form data)."""
    is_json = request.is_json or request.content_type == 'application/json'
    if is_json:
        data = request.get_json() or {}
        name    = data.get('name', '').strip()
        email   = data.get('email', '').strip()
        contact = data.get('contact', '').strip()
        message = data.get('message', '').strip()
    else:
        name    = request.form.get('name', '').strip()
        email   = request.form.get('email', '').strip()
        contact = request.form.get('contact', '').strip()
        message = request.form.get('message', '').strip()

    if not name or not email or not message:
        if is_json:
            return jsonify({'status': 'error', 'message': 'Please fill in all required fields.'}), 400
        return '''<script>
            alert("Please fill in all required fields.");
            window.history.back();
        </script>'''

    conn = get_db()
    conn.execute(
        'INSERT INTO contact_messages (name, email, contact, message) VALUES (?, ?, ?, ?)',
        (name, email, contact, message)
    )
    conn.commit()
    conn.close()

    if is_json:
        return jsonify({'status': 'success', 'message': 'Thank you! Your message has been sent.'})

    # Non-JSON (classic form post) success path — must still return a response,
    # otherwise Flask raises "View function did not return a response" (HTTP 500).
    return '''<script>
        alert("Thank you! Your message has been sent.");
        window.location.href = "index.php";
    </script>'''


# ── API: Product Availability ─────────────────────────────────

@app.route('/api/product_availability.php', methods=['GET'])
@app.route('/api/product_availability', methods=['GET'])
@app.route('/product_availability.php', methods=['GET'])
@app.route('/product_availability', methods=['GET'])
def get_product_availability():
    """Fetch availability status of all products."""
    conn = get_db()
    rows = conn.execute('SELECT product_id, is_available FROM product_availability').fetchall()
    conn.close()

    availability = {}
    for row in rows:
        availability[row['product_id']] = bool(row['is_available'])

    return jsonify(availability)


@app.route('/api/toggle_product_availability.php', methods=['POST'])
@app.route('/api/toggle_product_availability', methods=['POST'])
@app.route('/toggle_product_availability.php', methods=['POST'])
@app.route('/toggle_product_availability', methods=['POST'])
def toggle_product_availability():
    """Toggle or set product availability status (1 = Available, 0 = Sold Out). Admin only."""
    admin, err = _require_admin()
    if err:
        return err

    data = request.get_json() or {}
    product_id = data.get('product_id', '').strip()
    is_available = data.get('is_available', True)

    if not product_id:
        return jsonify({'status': 'error', 'message': 'Product ID is required.'}), 400

    int_val = 1 if is_available else 0
    conn = get_db()
    conn.execute(
        '''INSERT INTO product_availability (product_id, is_available, updated_at)
           VALUES (?, ?, CURRENT_TIMESTAMP)
           ON CONFLICT(product_id) DO UPDATE SET is_available = excluded.is_available, updated_at = CURRENT_TIMESTAMP''',
        (product_id, int_val)
    )
    conn.commit()
    conn.close()

    status_text = 'available' if is_available else 'sold out / unavailable'
    return jsonify({
        'status': 'success',
        'message': f'Product "{product_id}" is now marked as {status_text}.',
        'product_id': product_id,
        'is_available': bool(is_available)
    })


# ── API: Contact Messages Fetch, Read Status & Delete ────────

@app.route('/api/fetch_contacts.php', methods=['GET'])
@app.route('/api/fetch_contacts', methods=['GET'])
@app.route('/fetch_contacts.php', methods=['GET'])
@app.route('/fetch_contacts', methods=['GET'])
def fetch_contacts():
    """Fetch all submitted customer contact inquiries. Admin only."""
    admin, err = _require_admin()
    if err:
        return err

    conn = get_db()
    rows = conn.execute('SELECT * FROM contact_messages ORDER BY created_at DESC').fetchall()
    conn.close()

    contacts = []
    for r in rows:
        contacts.append({
            'id': r['id'],
            'name': r['name'],
            'email': r['email'],
            'contact': r['contact'],
            'message': r['message'],
            'is_read': bool(r['is_read']) if 'is_read' in r.keys() else False,
            'created_at': _iso(r['created_at']),
        })

    return jsonify(contacts)


@app.route('/api/mark_contact_read.php', methods=['POST'])
@app.route('/api/mark_contact_read', methods=['POST'])
@app.route('/mark_contact_read.php', methods=['POST'])
@app.route('/mark_contact_read', methods=['POST'])
def mark_contact_read():
    """Mark a contact message (or all) as read/unread. Admin only."""
    admin, err = _require_admin()
    if err:
        return err

    data = request.get_json() or {}
    conn = get_db()

    if data.get('mark_all'):
        conn.execute('UPDATE contact_messages SET is_read = 1')
        conn.commit()
        conn.close()
        return jsonify({'status': 'success', 'message': 'All contact messages marked as read.'})

    message_id = data.get('id')
    is_read = data.get('is_read', True)

    if not message_id:
        conn.close()
        return jsonify({'status': 'error', 'message': 'Invalid message ID.'}), 400

    int_val = 1 if is_read else 0
    conn.execute('UPDATE contact_messages SET is_read = ? WHERE id = ?', (int_val, message_id))
    conn.commit()
    conn.close()

    read_label = 'read' if is_read else 'unread'
    return jsonify({
        'status': 'success',
        'message': f'Message #{message_id} marked as {read_label}.',
        'id': message_id,
        'is_read': bool(is_read)
    })


@app.route('/api/delete_contact.php', methods=['POST'])
@app.route('/api/delete_contact', methods=['POST'])
@app.route('/delete_contact.php', methods=['POST'])
@app.route('/delete_contact', methods=['POST'])
def delete_contact():
    """Delete a contact message by ID. Admin only."""
    admin, err = _require_admin()
    if err:
        return err

    data = request.get_json() or {}
    message_id = data.get('id')

    if not message_id:
        return jsonify({'status': 'error', 'message': 'Invalid message ID.'}), 400

    conn = get_db()
    conn.execute('DELETE FROM contact_messages WHERE id = ?', (message_id,))
    conn.commit()
    conn.close()

    return jsonify({'status': 'success', 'message': f'Contact message #{message_id} deleted.'})


# ── API: Sales Analytics ──────────────────────────────────────

@app.route('/api/sales_analytics.php', methods=['GET'])
@app.route('/api/sales_analytics', methods=['GET'])
@app.route('/sales_analytics.php', methods=['GET'])
@app.route('/sales_analytics', methods=['GET'])
def sales_analytics():
    """Comprehensive sales analytics for admin dashboard. Admin only."""
    admin, err = _require_admin()
    if err:
        return err

    conn = get_db()

    # Total orders & gross revenue
    total_row = conn.execute(
        "SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as total FROM orders WHERE status != 'cancelled'"
    ).fetchone()
    all_orders_count = conn.execute("SELECT COUNT(*) as count FROM orders").fetchone()['count']

    today_row = conn.execute(
        "SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as total FROM orders WHERE DATE(order_date) = DATE('now') AND status != 'cancelled'"
    ).fetchone()

    month_row = conn.execute(
        "SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as total FROM orders "
        "WHERE strftime('%m', order_date) = strftime('%m', 'now') "
        "AND strftime('%Y', order_date) = strftime('%Y', 'now') AND status != 'cancelled'"
    ).fetchone()

    # Status counts
    status_rows = conn.execute(
        "SELECT status, COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue FROM orders GROUP BY status"
    ).fetchall()

    status_counts = {'pending': 0, 'received': 0, 'completed': 0, 'cancelled': 0}
    status_revenue = {'pending': 0.0, 'received': 0.0, 'completed': 0.0, 'cancelled': 0.0}

    for sr in status_rows:
        s = sr['status'] or 'pending'
        status_counts[s] = sr['count']
        status_revenue[s] = float(sr['revenue'])

    # Parse best selling items from non-cancelled order_details
    order_details_rows = conn.execute(
        "SELECT order_details, total_price FROM orders WHERE status != 'cancelled'"
    ).fetchall()

    item_popularity = {}
    for od in order_details_rows:
        raw_text = od['order_details'] or ''
        parts = [p.strip() for p in raw_text.split(',') if p.strip()]
        for p in parts:
            # Extract main name before parentheses
            main_name = p.split('(')[0].strip()
            if main_name:
                item_popularity[main_name] = item_popularity.get(main_name, 0) + 1

    sorted_items = sorted(
        [{'name': k, 'count': v} for k, v in item_popularity.items()],
        key=lambda x: x['count'],
        reverse=True
    )[:10]

    # Recent orders summary
    recent_orders = conn.execute(
        "SELECT id, customer_name, total_price, status, order_date FROM orders ORDER BY order_date DESC LIMIT 5"
    ).fetchall()

    recent_list = []
    for ro in recent_orders:
        recent_list.append({
            'id': ro['id'],
            'customer_name': ro['customer_name'],
            'total_price': ro['total_price'],
            'status': ro['status'],
            'order_date': _iso(ro['order_date'])
        })

    conn.close()

    total_gross = float(total_row['total'])
    valid_count = int(total_row['count'])
    aov = (total_gross / valid_count) if valid_count > 0 else 0.0

    return jsonify({
        'status': 'success',
        'total_revenue': total_gross,
        'total_orders': all_orders_count,
        'valid_orders_count': valid_count,
        'average_order_value': round(aov, 2),
        'today': {
            'revenue': float(today_row['total']),
            'orders': int(today_row['count'])
        },
        'this_month': {
            'revenue': float(month_row['total']),
            'orders': int(month_row['count'])
        },
        'status_breakdown': {
            'counts': status_counts,
            'revenue': status_revenue
        },
        'top_selling_items': sorted_items,
        'recent_activity': recent_list
    })


# ── Main ──────────────────────────────────────────────────────

try:
    init_db()
except Exception as e:
    print(f"[WARN] Database initialization notice: {e}")

if __name__ == '__main__':
    import socket

    def _lan_ip():
        """Best-effort local LAN IP (the address other devices use to reach this machine)."""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(('8.8.8.8', 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except Exception:
            return '127.0.0.1'

    host = '0.0.0.0'  # Listen on all interfaces so phones/devices on the same WiFi can connect.
    lan_ip = _lan_ip()
    port = int(os.environ.get('PORT', '5000') or '5000')

    print()
    print("== Mr. Boy SpecialTea Server ==")
    print(f"   Local:   http://localhost:{port}")
    print(f"   Network: http://{lan_ip}:{port}   <- open this on your phone (same WiFi)")
    print("   Press Ctrl+C to stop")
    print()
    app.run(debug=True, host=host, port=port)
