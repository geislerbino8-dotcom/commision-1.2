const chatbotBtn = document.getElementById("chatbot-btn");
const chatbotWindow = document.getElementById("chatbot-window");
const closeChat = document.getElementById("close-chat");

chatbotBtn.addEventListener("click", () => {
    chatbotWindow.style.display = "block";
});

closeChat.addEventListener("click", () => {
    chatbotWindow.style.display = "none";
});