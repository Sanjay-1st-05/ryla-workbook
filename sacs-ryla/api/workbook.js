const API_URL = "https://script.google.com/macros/s/AKfycbzb--cocPl8aZbJjXC8UA4VkDT3AdBm4Za-qqS0O7jLn6H-PkmMA_i78Cxj4egwr7lvnQ/exec";

async function saveToBackend() {
  try {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(collectData())
    });

    console.log("Saved to Google Sheets");
  } catch (err) {
    console.error("Save failed", err);
  }
}