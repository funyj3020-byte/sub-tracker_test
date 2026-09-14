function getMonthlyAmount(subscription) {
  if (subscription.cycle === "monthly") {
    return subscription.amount;
  } else if (subscription.cycle === "yearly") {
    return Math.round(subscription.amount / 12);
  }
    return 0;
}

function getTotalMonthlyAmount(subscriptions) {
  let total = 0;
    for (const subscription of subscriptions) {
        total += getMonthlyAmount(subscription);
    }
    return total;
}

function getTotalYearlyAmount(subscriptions) {
    let total = 0;
    for (const subscription of subscriptions) {
        total += subscription.cycle === "monthly"
            ? subscription.amount * 12
            : subscription.cycle === "yearly" ? subscription.amount : 0;
    }
    return total;
}

function getDaysUntilNextPayment(nextPaymentDate) {
    return getDaysBetweenDates(new Date().toISOString().slice(0, 10), nextPaymentDate);
}

function getDaysBetweenDates(date1, date2) {
    const d1 = new Date(`${date1}T00:00:00`);
    const d2 = new Date(`${date2}T00:00:00`);
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
}

function getSubscriptionsDueInDays(subscriptions, days) {
    return subscriptions.filter((subscription) => {
        const daysUntilPayment = getDaysUntilNextPayment(subscription.nextPaymentDate);
        return daysUntilPayment >= 0 && daysUntilPayment <= days;
    });
}

function getMonthlyAmountByCategory(subscriptions) {
    const categoryTotals = {};
    for (const subscription of subscriptions) {
        const category = subscription.category;
        categoryTotals[category] = (categoryTotals[category] || 0) + getMonthlyAmount(subscription);
    }
    return categoryTotals;
}

function getSubscriptionResultsByCard(subscriptions) {
    const cardResults = {};

    for (const subscription of subscriptions) {
        const cardName = subscription.paymentMethod || "미지정";

        if (!cardResults[cardName]) {
            cardResults[cardName] = [];
        }

        cardResults[cardName].push(subscription);
    }

    return cardResults;
}

