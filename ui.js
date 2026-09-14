import "./lojic.js";

const currency = (value) => `${Math.round(value).toLocaleString("ko-KR")}원`;

export function monthlyAmount(subscription) {
  return subscription.cycle === "yearly" ? Math.round(subscription.amount / 12) : Number(subscription.amount) || 0;
}

export function totalMonthly(subscriptions) {
  return subscriptions.reduce((total, item) => total + monthlyAmount(item), 0);
}

export function totalYearly(subscriptions) {
  return subscriptions.reduce((total, item) => total + (item.cycle === "yearly" ? Number(item.amount) : Number(item.amount) * 12), 0);
}

export function daysUntil(dateString) {
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(`${dateString}T00:00:00`);
  return Math.ceil((target - todayDate) / 86400000);
}

export function formatDday(days) {
  if (days === 0) return "D-Day";
  if (days < 0) return `D+${Math.abs(days)}`;
  return `D-${days}`;
}

export function renderSummary(subscriptions) {
  const weekItems = subscriptions.filter((item) => {
    const days = daysUntil(item.nextPaymentDate);
    return days >= 0 && days <= 7;
  });
  document.querySelector("#monthly-total").textContent = currency(totalMonthly(subscriptions));
  document.querySelector("#yearly-total").textContent = currency(totalYearly(subscriptions));
  document.querySelector("#week-count").textContent = `${weekItems.length}건`;
  document.querySelector("#week-total").textContent = `예정 금액 ${currency(weekItems.reduce((sum, item) => sum + Number(item.amount), 0))}`;
  document.querySelector("#subscription-count").textContent = `${subscriptions.length}개`;
}

export function renderCategories(subscriptions) {
  const container = document.querySelector("#category-breakdown");
  const totals = {};
  subscriptions.forEach((item) => { totals[item.category] = (totals[item.category] || 0) + monthlyAmount(item); });
  const total = Object.values(totals).reduce((sum, value) => sum + value, 0);
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  container.innerHTML = entries.length ? entries.map(([category, amount]) => {
    const percentage = total ? Math.round((amount / total) * 100) : 0;
    return `<div class="category-row"><div class="category-label"><span>${escapeHtml(category)}</span><span>${percentage}% · ${currency(amount)}</span></div><div class="bar-track"><div class="bar-fill" style="width:${percentage}%"></div></div></div>`;
  }).join("") : '<p class="category-empty">아직 등록된 구독이 없습니다.</p>';
}

export function renderSubscriptions(subscriptions, onEdit, onDelete) {
  const container = document.querySelector("#subscription-list");
  container.innerHTML = subscriptions.length ? subscriptions.map((item) => {
    const days = daysUntil(item.nextPaymentDate);
    const ddayClass = days <= 0 ? "dday today" : "dday";
    return `<article class="subscription-card"><div class="service-icon">${escapeHtml(item.name.slice(0, 1))}</div><div class="card-main"><div class="card-title">${escapeHtml(item.name)} <span class="dday ${ddayClass}">${formatDday(days)}</span></div><div class="card-meta">${escapeHtml(item.category)} · ${escapeHtml(item.paymentMethod || "카드 미지정")} · ${item.cycle === "yearly" ? "매년" : "매월"}</div></div><div class="card-price"><strong>${currency(monthlyAmount(item))}<small>/월</small></strong><div class="card-actions"><button class="icon-button" data-action="edit" data-id="${item.id}">수정</button><button class="icon-button" data-action="delete" data-id="${item.id}">삭제</button></div></div></article>`;
  }).join("") : '<div class="empty-state">아직 구독이 없습니다.<br>오른쪽 폼에서 첫 구독을 추가해보세요.</div>';
  container.querySelectorAll("[data-action=edit]").forEach((button) => button.addEventListener("click", () => onEdit(button.dataset.id)));
  container.querySelectorAll("[data-action=delete]").forEach((button) => button.addEventListener("click", () => onDelete(button.dataset.id)));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}
