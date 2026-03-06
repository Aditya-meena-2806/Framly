
const fs = require('fs');
const path = require('path');

// Global data store
let data = {
    farmers: [],
    products: [],
    admins: [{ _id: 'admin-id-123', username: 'admin', password: 'admin123' }],
    users: []
};

const filePath = path.join(__dirname, 'mock_db.json');

function loadData() {
    if (fs.existsSync(filePath)) {
        try {
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
            console.error("Error loading mock DB:", e);
        }
    }
}

function saveData() {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

loadData();

class MockModel {
    constructor(collectionName, itemData) {
        this.collectionName = collectionName;
        Object.assign(this, itemData);
    }

    async save() {
        if (!this._id) {
            this._id = 'mock_' + Math.random().toString(36).substr(2, 9);
        }
        const index = data[this.collectionName].findIndex(i => i._id === this._id);
        if (index !== -1) {
            data[this.collectionName][index] = { ...this };
        } else {
            data[this.collectionName].push({ ...this });
        }
        saveData();
        return this;
    }

    static createModel(collectionName) {
        return class extends MockModel {
            constructor(itemData) {
                super(collectionName, itemData);
            }

            static async find(query = {}) {
                let results = data[collectionName].filter(item => {
                    for (let key in query) {
                        if (item[key] !== query[key]) return false;
                    }
                    return true;
                });

                // Mocking Mongoose chaining
                const chain = {
                    populate: (path, fields) => {
                        // Very basic mock of populate
                        results = results.map(item => {
                            if (path === 'farmerId' && item.farmerId) {
                                const farmer = data.farmers.find(f => f._id === item.farmerId);
                                if (farmer) {
                                    item.farmerId = { _id: farmer._id, name: farmer.name, email: farmer.email };
                                }
                            }
                            return item;
                        });
                        return chain;
                    },
                    then: (resolve) => resolve(results),
                    catch: (reject) => { }
                };
                return chain;
            }

            static async findOne(query) {
                const item = data[collectionName].find(item => {
                    for (let key in query) {
                        if (item[key] !== query[key]) return false;
                    }
                    return true;
                });
                return item || null;
            }

            static async findById(id) {
                const item = data[collectionName].find(item => item._id === id);
                return item || null;
            }

            static async findByIdAndUpdate(id, update) {
                const index = data[collectionName].findIndex(item => item._id === id);
                if (index !== -1) {
                    data[collectionName][index] = { ...data[collectionName][index], ...update };
                    saveData();
                    return data[collectionName][index];
                }
                return null;
            }

            static async findByIdAndDelete(id) {
                data[collectionName] = data[collectionName].filter(item => item._id !== id);
                saveData();
                return true;
            }
        };
    }
}

module.exports = {
    Farmer: MockModel.createModel('farmers'),
    Product: MockModel.createModel('products'),
    Admin: MockModel.createModel('admins'),
    User: MockModel.createModel('users')
};
