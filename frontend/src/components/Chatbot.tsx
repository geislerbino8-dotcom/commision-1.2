import { FormEvent, useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { MENU_ITEMS } from '../data/menu';
import { MenuItem } from '../types';
import './Chatbot.css';

interface ChatbotProps {
  productAvailability: Record<string, boolean>;
  onAddToCart: (itemName: string, size: string, price: number) => void;
  onNavigate: (tab: string) => void;
}

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
}

const STORE_ADDRESS = 'Blk 14 Lot 4 Phase 1, Dela Costa Homes V, Burgos, Rodriguez, Rizal, Philippines 1860';
const STORE_PHONE = '0917 888 4737';

function getProductMatch(query: string, products: MenuItem[]) {
  const normalizedQuery = query
    .replace(/^(please\s+)?(add|order|get|buy)\s+/i, '')
    .replace(/\s+(16|22)\s?oz$/i, '')
    .trim();

  if (!normalizedQuery) return undefined;

  return products.find((item) =>
    item.name.toLowerCase() === normalizedQuery.toLowerCase() ||
    item.id.toLowerCase() === normalizedQuery.toLowerCase()
  ) ?? products.find((item) =>
    item.name.toLowerCase().includes(normalizedQuery.toLowerCase())
  );
}

export function Chatbot({ productAvailability, onAddToCart, onNavigate }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: 'Hi! Welcome to Mr. Boy SpecialTea. Ask me about our menu, add a drink to your cart, or type “branch” or “promo” for store information.',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const replyTo = (rawMessage: string) => {
    const message = rawMessage.trim();
    const normalizedMessage = message.toLowerCase();

    if (/^(menu|show menu|what do you have)\b/.test(normalizedMessage)) {
      const availableItems = MENU_ITEMS.filter((item) => productAvailability[item.id] !== false);
      const featuredItems = availableItems.slice(0, 8).map((item) => {
        const startingPrice = Math.min(...item.prices.map((price) => price.price));
        return `${item.name} - from ₱${startingPrice}`;
      });
      return featuredItems.length
        ? `Here are some available drinks: ${featuredItems.join('; ')}. Type “add” followed by a drink name to put it in your cart, or open the full menu.`
        : 'The menu is temporarily unavailable. Please check back soon or contact the store.';
    }

    if (/\b(add|order|get|buy)\b/.test(normalizedMessage)) {
      const product = getProductMatch(message, MENU_ITEMS);
      if (!product) return 'I couldn’t find that item. Type “menu” to browse available drinks.';
      if (productAvailability[product.id] === false) {
        return `${product.name} is currently marked unavailable. Type “menu” to see what is available.`;
      }

      const requestedSize = normalizedMessage.match(/\b(16|22)\s?oz\b/)?.[0]?.replace(/\s+/g, '') ?? '16oz';
      const selectedPrice = product.prices.find((price) => price.size.toLowerCase() === requestedSize.toLowerCase())
        ?? product.prices[0];
      if (!selectedPrice) return `${product.name} does not have a listed price right now. Please open the menu for details.`;

      onAddToCart(product.name, selectedPrice.size, selectedPrice.price);
      return `Added ${product.name} (${selectedPrice.size}) to your cart for ₱${selectedPrice.price}. Type “cart” to review your order.`;
    }

    if (/\b(cart|checkout|my order)\b/.test(normalizedMessage)) {
      onNavigate('cart');
      return 'I’ve opened your cart so you can review your order.';
    }

    if (/\b(promo|promos|promotion|discount)\b/.test(normalizedMessage)) {
      onNavigate('home');
      return 'Please check the home page for the latest promotions. I don’t have a current offer to confirm here.';
    }

    if (/\b(branch|location|address|where are you)\b/.test(normalizedMessage)) {
      return `You can find us at ${STORE_ADDRESS}. Call us at ${STORE_PHONE} if you need help.`;
    }

    if (/\b(contact|phone|call|message)\b/.test(normalizedMessage)) {
      onNavigate('contact');
      return `I’ve opened the contact page. You can also call us at ${STORE_PHONE}.`;
    }

    const product = getProductMatch(message, MENU_ITEMS);
    if (product) {
      const prices = product.prices.map((price) => `${price.size}: ₱${price.price}`).join(', ');
      const availability = productAvailability[product.id] === false ? ' It is currently unavailable.' : '';
      return `${product.name} is ${prices}.${availability} To add it, type “add ${product.name}”.`;
    }

    return 'I can help with the menu, adding drinks to your cart, promotions, store location, and contact details. Try “menu”, “add matcha”, “cart”, or “branch”.';
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = input.trim();
    if (!message) return;

    const response = replyTo(message);
    setMessages((current) => [
      ...current,
      { sender: 'user', text: message },
      { sender: 'bot', text: response },
    ]);
    setInput('');
  };

  return (
    <div className="store-chatbot">
      {isOpen && (
        <section className="store-chatbot__window" role="dialog" aria-label="Mr. Boy SpecialTea Assistant">
          <header className="store-chatbot__header">
            <div>
              <strong>Mr. Boy SpecialTea Assistant</strong>
              <span>Here to help with your order</span>
            </div>
            <button
              className="store-chatbot__close"
              type="button"
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          </header>

          <div className="store-chatbot__messages" aria-live="polite">
            {messages.map((message, index) => (
              <div
                className={`store-chatbot__message store-chatbot__message--${message.sender}`}
                key={`${index}-${message.sender}`}
              >
                {message.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="store-chatbot__input" onSubmit={handleSubmit}>
            <input
              aria-label="Message"
              autoComplete="off"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about menu or ordering..."
            />
            <button type="submit" aria-label="Send message" disabled={!input.trim()}>
              <Send size={18} />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="store-chatbot__toggle"
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <X size={25} /> : <MessageCircle size={27} />}
      </button>
    </div>
  );
}
