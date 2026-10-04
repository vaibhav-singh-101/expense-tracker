const API_URL = "http://localhost:5000/api/transactions";

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token) {
    window.location.href = "login.html";
}

const userName = document.getElementById("userName");

if (user && userName) {
    userName.textContent = user.name;
}

const transactionForm =
    document.getElementById("transactionForm");

const textInput =
    document.getElementById("text");

const amountInput =
    document.getElementById("amount");

const typeInput =
    document.getElementById("type");

const categoryInput =
    document.getElementById("category");

const transactionList =
    document.getElementById("transactionList");

const emptyMessage =
    document.getElementById("emptyMessage");

const balanceElement =
    document.getElementById("balance");

const incomeElement =
    document.getElementById("income");

const expenseElement =
    document.getElementById("expense");

const clearAllButton =
    document.getElementById("clearAll");

const searchInput =
    document.getElementById("searchInput");

const filterType =
    document.getElementById("filterType");

const filterCategory =
    document.getElementById("filterCategory");

let allTransactions = [];

let incomeExpenseChart;
let categoryChart;

async function loadTransactions() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "login.html";
                return;
            }

            throw new Error(
                data.message || "Failed to load transactions"
            );
        }

        allTransactions = data;

        applyFilters();

    } catch (error) {
        console.error(
            "Load Transactions Error:",
            error
        );

        alert(
            "Failed to load transactions. Please check your backend."
        );
    }
}

if (transactionForm) {
    transactionForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const text =
                textInput.value.trim();

            const amount =
                parseFloat(amountInput.value);

            const type =
                typeInput.value;

            const category =
                categoryInput.value;

            if (
                text === "" ||
                isNaN(amount) ||
                amount <= 0 ||
                type === "" ||
                category === ""
            ) {
                alert(
                    "Please fill all fields correctly."
                );
                return;
            }

            const transaction = {
                text: text,
                amount: amount,
                type: type,
                category: category
            };

            try {
                const response =
                    await fetch(API_URL, {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                            "Authorization":
                                `Bearer ${token}`
                        },
                        body:
                            JSON.stringify(
                                transaction
                            )
                    });

                const data =
                    await response.json();

                if (!response.ok) {

                    if (response.status === 401) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        window.location.href =
                            "login.html";
                        return;
                    }

                    throw new Error(
                        data.message ||
                        "Failed to add transaction"
                    );
                }

                transactionForm.reset();

                loadTransactions();

            } catch (error) {

                console.error(
                    "Add Transaction Error:",
                    error
                );

                alert(
                    "Failed to add transaction."
                );
            }
        }
    );
}

function displayTransactions(
    transactions
) {
    transactionList.innerHTML = "";

    if (transactions.length === 0) {

        emptyMessage.style.display =
            "block";

        updateSummary(transactions);

        return;
    }

    emptyMessage.style.display =
        "none";

    transactions.forEach(
        function (transaction) {

            const li =
                document.createElement("li");

            li.classList.add(
                "transaction",
                transaction.type
            );

            const sign =
                transaction.type === "income"
                    ? "+"
                    : "-";

            const date =
                new Date(
                    transaction.date
                ).toLocaleDateString();

            li.innerHTML = `
                <div class="transaction-info">
                    <h4>
                        ${transaction.text}
                    </h4>

                    <small>
                        ${transaction.category}
                        •
                        ${date}
                    </small>
                </div>

                <div class="transaction-right">

                    <span class="transaction-amount">
                        ${sign}₹${transaction.amount.toFixed(2)}
                    </span>

                    <button
                        class="edit-btn"
                        onclick="editTransaction('${transaction._id}')">
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteTransaction('${transaction._id}')">
                        Delete
                    </button>

                </div>
            `;

            transactionList.appendChild(li);
        }
    );

    updateSummary(transactions);
}

function updateSummary(
    transactions
) {
    let income = 0;
    let expense = 0;

    transactions.forEach(
        function (transaction) {

            if (
                transaction.type === "income"
            ) {
                income += transaction.amount;
            } else {
                expense += transaction.amount;
            }
        }
    );

    const balance =
        income - expense;

    incomeElement.textContent =
        `₹${income.toFixed(2)}`;

    expenseElement.textContent =
        `₹${expense.toFixed(2)}`;

    balanceElement.textContent =
        `₹${balance.toFixed(2)}`;
        updateCharts(transactions);
}

function updateCharts(transactions) {

    let income = 0;
    let expense = 0;

    const categories = {};

    transactions.forEach(function (transaction) {

        if (transaction.type === "income") {
            income += transaction.amount;
        } else {

            expense += transaction.amount;

            if (!categories[transaction.category]) {
                categories[transaction.category] = 0;
            }

            categories[transaction.category] +=
                transaction.amount;
        }
    });

    const incomeExpenseCanvas =
        document.getElementById(
            "incomeExpenseChart"
        );

    const categoryCanvas =
        document.getElementById(
            "categoryChart"
        );

    if (!incomeExpenseCanvas || !categoryCanvas) {
        return;
    }

    if (incomeExpenseChart) {
        incomeExpenseChart.destroy();
    }

    if (categoryChart) {
        categoryChart.destroy();
    }

    incomeExpenseChart =
        new Chart(
            incomeExpenseCanvas,
            {
                type: "bar",

                data: {
                    labels: [
                        "Income",
                        "Expense"
                    ],

                    datasets: [
                        {
                            label: "Amount",

                            data: [
                                income,
                                expense
                            ]
                        }
                    ]
                },

                options: {
                    responsive: true,

                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            }
        );

    categoryChart =
        new Chart(
            categoryCanvas,
            {
                type: "doughnut",

                data: {
                    labels:
                        Object.keys(categories),

                    datasets: [
                        {
                            data:
                                Object.values(
                                    categories
                                )
                        }
                    ]
                },

                options: {
                    responsive: true
                }
            }
        );
}
function applyFilters() {

    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";

    const type =
        filterType
            ? filterType.value
            : "all";

    const category =
        filterCategory
            ? filterCategory.value
            : "all";

    const filteredTransactions =
        allTransactions.filter(
            function (transaction) {

                const matchesSearch =
                    transaction.text
                        .toLowerCase()
                        .includes(search);

                const matchesType =
                    type === "all" ||
                    transaction.type === type;

                const matchesCategory =
                    category === "all" ||
                    transaction.category === category;

                return (
                    matchesSearch &&
                    matchesType &&
                    matchesCategory
                );
            }
        );

    displayTransactions(
        filteredTransactions
    );
}

async function editTransaction(id) {

    const transaction =
        allTransactions.find(
            function (item) {
                return item._id === id;
            }
        );

    if (!transaction) {
        return;
    }

    const newText =
        prompt(
            "Enter transaction name:",
            transaction.text
        );

    if (newText === null) {
        return;
    }

    const newAmount =
        prompt(
            "Enter amount:",
            transaction.amount
        );

    if (newAmount === null) {
        return;
    }

    const newCategory =
        prompt(
            "Enter category:",
            transaction.category
        );

    if (newCategory === null) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                        "Authorization":
                            `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        text: newText,
                        amount:
                            parseFloat(newAmount),
                        type:
                            transaction.type,
                        category:
                            newCategory
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to update transaction"
            );
        }

        loadTransactions();

    } catch (error) {

        console.error(
            "Edit Transaction Error:",
            error
        );

        alert(
            "Failed to update transaction."
        );
    }
}

async function deleteTransaction(id) {

    const confirmation =
        confirm(
            "Delete this transaction?"
        );

    if (!confirmation) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href =
                    "login.html";
                return;
            }

            throw new Error(
                data.message ||
                "Failed to delete transaction"
            );
        }

        loadTransactions();

    } catch (error) {

        console.error(
            "Delete Transaction Error:",
            error
        );

        alert(
            "Failed to delete transaction."
        );
    }
}

if (clearAllButton) {

    clearAllButton.addEventListener(
        "click",
        async function () {

            try {

                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "GET",
                            headers: {
                                "Authorization":
                                    `Bearer ${token}`
                            }
                        }
                    );

                const transactions =
                    await response.json();

                if (!response.ok) {

                    if (
                        response.status === 401
                    ) {
                        localStorage.removeItem(
                            "token"
                        );

                        localStorage.removeItem(
                            "user"
                        );

                        window.location.href =
                            "login.html";

                        return;
                    }

                    throw new Error(
                        transactions.message ||
                        "Failed to fetch transactions"
                    );
                }

                if (
                    transactions.length === 0
                ) {
                    alert(
                        "There are no transactions to delete."
                    );

                    return;
                }

                const confirmation =
                    confirm(
                        "Are you sure you want to delete all transactions?"
                    );

                if (!confirmation) {
                    return;
                }

                for (
                    const transaction
                    of transactions
                ) {

                    await fetch(
                        `${API_URL}/${transaction._id}`,
                        {
                            method: "DELETE",
                            headers: {
                                "Authorization":
                                    `Bearer ${token}`
                            }
                        }
                    );
                }

                loadTransactions();

            } catch (error) {

                console.error(
                    "Clear All Error:",
                    error
                );

                alert(
                    "Failed to clear transactions."
                );
            }
        }
    );
}

if (searchInput) {
    searchInput.addEventListener(
        "input",
        applyFilters
    );
}

if (filterType) {
    filterType.addEventListener(
        "change",
        applyFilters
    );
}

if (filterCategory) {
    filterCategory.addEventListener(
        "change",
        applyFilters
    );
}

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "login.html";
        }
    );
}

loadTransactions();