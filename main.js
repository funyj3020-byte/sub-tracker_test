import { monthlyAmount, renderSummary, renderCategories, renderSubscriptions } from "./ui.js";

const STORAGE_KEY = "subscription-tracker-data";
let subscriptions = loadSubscriptions();

const form = document.querySelector("#subscription-form");
const cancelButton = document.querySelector("#cancel-edit");

function loadSubscriptions() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveSubscriptions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  } catch (error) {
    console.error("구독 데이터를 저장할 수 없습니다.", error);
  }
}

function refresh() {
  renderSummary(subscriptions);
  renderCategories(subscriptions);
  renderSubscriptions(subscriptions, beginEdit, removeSubscription);
}

function readForm() {
  const formData = new FormData(form);
  return { name: formData.get("name").trim(), amount: Number(formData.get("amount")), cycle: formData.get("cycle"), nextPaymentDate: formData.get("nextPaymentDate"), category: formData.get("category").trim(), paymentMethod: formData.get("paymentMethod").trim() };
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const id = document.querySelector("#subscription-id").value;
  const data = readForm();
  if (id) subscriptions = subscriptions.map((item) => item.id === id ? { ...item, ...data } : item);
  else subscriptions = [{ id: createId(), ...data }, ...subscriptions];
  saveSubscriptions();
  // 새로 추가할 때는 입력값을 그대로 두고, 수정 저장일 때만 폼을 초기화합니다.
  if (id) resetForm();
  refresh();
});

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `subscription-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function beginEdit(id) {
  const item = subscriptions.find((subscription) => subscription.id === id);
  if (!item) return;
  Object.entries(item).forEach(([key, value]) => { const field = document.querySelector(`#${key === "nextPaymentDate" ? "next-payment-date" : key}`); if (field) field.value = value; });
  document.querySelector("#subscription-id").value = item.id;
  document.querySelector("#form-title").textContent = "구독 수정";
  document.querySelector("#submit-button").textContent = "수정 저장";
  cancelButton.classList.remove("hidden");
  document.querySelector("#name").focus();
}

function removeSubscription(id) {
  const item = subscriptions.find((subscription) => subscription.id === id);
  if (!item || !window.confirm(`${item.name} 구독을 삭제할까요?`)) return;
  subscriptions = subscriptions.filter((subscription) => subscription.id !== id);
  saveSubscriptions();
  refresh();
}

function resetForm() {
  form.reset();
  document.querySelector("#subscription-id").value = "";
  document.querySelector("#form-title").textContent = "새 구독 추가";
  document.querySelector("#submit-button").textContent = "구독 추가";
  cancelButton.classList.add("hidden");
}

cancelButton.addEventListener("click", resetForm);
refresh();
