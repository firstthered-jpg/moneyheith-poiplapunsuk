const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Transaction operations
  getTransactions: () => ipcRenderer.invoke('db:getTransactions'),
  addTransaction: (transaction) => ipcRenderer.invoke('db:addTransaction', transaction),
  updateTransaction: (id, transaction) => ipcRenderer.invoke('db:updateTransaction', id, transaction),
  deleteTransaction: (id) => ipcRenderer.invoke('db:deleteTransaction', id),

  // Goal operations
  getGoals: () => ipcRenderer.invoke('db:getGoals'),
  addGoal: (goal) => ipcRenderer.invoke('db:addGoal', goal),
  updateGoal: (id, goal) => ipcRenderer.invoke('db:updateGoal', id, goal),
  deleteGoal: (id) => ipcRenderer.invoke('db:deleteGoal', id),
});
