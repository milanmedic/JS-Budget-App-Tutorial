'use strict';

/*TO-DO: 
    2. Item percentages
    3. UI touch-ups
*/

//Budget Controller
let DataModule = (function(){

    let data;

    function Expense(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calculatePercentage = function(income) {
        this.percentage = Math.round(this.value / income * 100);
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    function Income(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            inc: 0,
            exp: 0,
        },
        budget: 0,
        percentage: -1,
    }

    function calculateTotal(type){
        let sum = 0;

        data.allItems[type].forEach(function(current){
            sum += current.value;
        })

        data.totals[type] = sum;
    }

    return {
        addItem: function(type, description, value) {
            let newItem, ID;

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if(type === 'exp') {
                newItem = new Expense(ID, description, value);
            } else if(type === 'inc'){
                newItem = new Income(ID, description, value);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        calculateBudget: function() {
            // calculate total income & expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate budget = income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // calculate the percentage of income that has been spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            } 
        },

        calculatePercentages: function() {
            if(data.allItems.exp.length !== 0){
                data.allItems.exp.forEach(function(current) {
                    current.calculatePercentage(data.totals.inc);
                })
            }
        },

        getPercentages: function() {
            let allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            })

            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
        },

        deleteItem: function(type, id) {
            let arrIDs, position;
            arrIDs = data.allItems[type].map(function(element) {
                return element.id;
            })
            position = arrIDs.indexOf(id);

            if(arrIDs.indexOf(id) !== -1) {
                data.allItems[type].splice(position,1);
            }
        },

        test: function() {
            console.log(data);
        }
    }
    
})();

//UI Controller
let UIModule = (function(){
    let domStrings;

    domStrings = {
        typeSelector: '.add__type',
        descriptionSelector: '.add__description',
        valueSelector: '.add__value',
        addBtnSelector: '.add__btn',
        incomeListSelector: '.income__list',
        expensesListSelector: '.expenses__list',
        budgetValueSelector: '.budget__value',
        budgetIncSelector: '.budget__income--value',
        budgetExpSelector: '.budget__expenses--value',
        percentageSelector: '.budget__expenses--percentage',
        containerSelector: '.container',
        expPercSelector: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    let nodeListForEach = function(list, callback) { //works like for-each
        for(let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    return {
        getInput: function() {
            return {
                type: document.querySelector(domStrings.typeSelector).value, //inc or exp
                description: document.querySelector(domStrings.descriptionSelector).value,
                value: parseFloat(document.querySelector(domStrings.valueSelector).value)
            }
        },

        getDomStrings: function() {
            return domStrings;
        },

        addListItem: function(item, type) {
            let htmlTemplate, element;

            if(type === 'inc') {
                element = domStrings.incomeListSelector;
                htmlTemplate = `<div class="item clearfix" id="inc-%id%">
                <div class="item__description">%description%</div>
                <div class="right clearfix">
                    <div class="item__value">+ %value%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn">
                            <i class="bla">X</i>
                        </button>
                    </div>
                </div>
            </div>`;
            } else if(type === 'exp'){
                element = domStrings.expensesListSelector;
                htmlTemplate = `<div class="item clearfix" id="exp-%id%">
                <div class="item__description">%description%</div>
                <div class="right clearfix">
                    <div class="item__value">- %value%</div>
                    <div class="item__percentage">21%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="bla">X</i></button>
                    </div>
                </div>
            </div>`;
            }

            let newHtml = htmlTemplate.replace('%id%', item.id);
            newHtml = newHtml.replace('%description%', item.description);
            newHtml = newHtml.replace('%value%', item.value);

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields: function() {
            let fields, fieldsArr;
            fields = document.querySelectorAll(`${domStrings.descriptionSelector}, ${domStrings.valueSelector}`);

            fieldsArr = Array.prototype.slice.call(fields); //because fields is not an array but a list, we need to do it like this
            fieldsArr.forEach(function(current) {
                current.value = '';
            });
        },

        displayBudget: function(obj) {
            document.querySelector(domStrings.budgetValueSelector).textContent = obj.budget;
            document.querySelector(domStrings.budgetIncSelector).textContent = obj.totalInc;
            document.querySelector(domStrings.budgetExpSelector).textContent = obj.totalExp;

            if(obj.percentage > 0) {
                document.querySelector(domStrings.percentageSelector).textContent = obj.percentage + '%';
            } else {
                document.querySelector(domStrings.percentageSelector).textContent = '---';
            }
        },

        deleteItemUI: function(elementID) {
            let element;
            element = document.querySelector(`#${elementID}`);
            element.parentElement.removeChild(element);

        },

        displayPercentages: function(percentages) {
            let fields = document.querySelectorAll(domStrings.expPercSelector); //returns a node list

            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            }); 
        },

        displayMonth: function() {
            let now = new Date();
            let months = ['January','February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            let year = now.getFullYear();
            let month = now.getMonth();

            document.querySelector(domStrings.dateLabel).textContent = `${months[month]} ${year}`;
        },

        changedType: function() {
            let inputs = document.querySelectorAll(`${domStrings.typeSelector},${domStrings.descriptionSelector},${domStrings.valueSelector}`);

            nodeListForEach(inputs, function(current) {
                current.classList.toggle('red-focus');
            }); 

            document.querySelector(domStrings.addBtnSelector).classList.toggle('red');
        }
    }
})();

//Global app controller
let controller = (function(UICtrl, BudgetCtrl) {
    
    let updateBudget = function() {
        let budget = 0;
        // 4. Calculate the budget
        BudgetCtrl.calculateBudget();
        // 2. Return budget
        budget = BudgetCtrl.getBudget();
        // 5. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    let updatePercentages = function() {
        // 1. Calculate percentages
        BudgetCtrl.calculatePercentages();
        // 2. Read them from budget controller
        // 3. Update the UI
        UICtrl.displayPercentages(BudgetCtrl.getPercentages());
    }

    let CtrlAddItem = function() {
        let input, newItem;
        // 1. Get the field input data
        input = UICtrl.getInput();

        if(input.description !== '' && !isNaN(input.value) && input.value > 0){
            // 2. Add item to budget controller
        newItem = BudgetCtrl.addItem(input.type, input.description, input.value);

        // 3. Add item to the UI
        UICtrl.addListItem(newItem, input.type);
        UICtrl.clearFields();

        // 4. Calculate and update budget 
        updateBudget();

        // 5. Calculate and update percentages
        updatePercentages();
        }
        
    }

    let CtrlDeleteItem = function(event) {
        let elementID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        let strings = elementID.split('-');
        // 1. Delete Item from data structure
        BudgetCtrl.deleteItem(strings[0], parseInt(strings[1]));
        // 2. Delete Item from UI
        UICtrl.deleteItemUI(elementID);
        // 3. Recalculate Budget
        updateBudget();

        // 5. Calculate and update percentages
        updatePercentages();
    }

    function setupEventListeners() {
        let domStrings = UICtrl.getDomStrings();
        document.querySelector(domStrings.addBtnSelector).addEventListener('click', CtrlAddItem);

        document.addEventListener('keydown', function(event) {
            if(event.keyCode === 13) {
                CtrlAddItem();
            }
        })

        document.querySelector(domStrings.containerSelector).addEventListener('click', CtrlDeleteItem);

        document.querySelector(domStrings.typeSelector).addEventListener('change', UICtrl.changedType);
    };

    return {
        init: function() {
            console.log('App started!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0,
            })
            
            setupEventListeners();
        }
    }

})(UIModule, DataModule);

controller.init();