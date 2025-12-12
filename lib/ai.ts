// AI utility functions for categorization, anomaly detection, and task prioritization

export async function categorizeTransaction(description: string, amount: number): Promise<string> {
  // Simple rule-based categorization (can be enhanced with OpenAI API)
  const desc = description.toLowerCase()
  
  if (desc.includes("salary") || desc.includes("wage") || desc.includes("payroll")) {
    return "Payroll"
  }
  if (desc.includes("rent") || desc.includes("lease")) {
    return "Rent"
  }
  if (desc.includes("office") || desc.includes("utilities") || desc.includes("electric")) {
    return "Utilities"
  }
  if (desc.includes("marketing") || desc.includes("ad") || desc.includes("advertisement")) {
    return "Marketing"
  }
  if (desc.includes("software") || desc.includes("subscription") || desc.includes("saas")) {
    return "Software"
  }
  if (desc.includes("travel") || desc.includes("flight") || desc.includes("hotel")) {
    return "Travel"
  }
  if (desc.includes("food") || desc.includes("restaurant") || desc.includes("meal")) {
    return "Food & Dining"
  }
  if (desc.includes("tax") || desc.includes("irs")) {
    return "Taxes"
  }
  if (desc.includes("client") || desc.includes("payment") || desc.includes("invoice")) {
    return "Revenue"
  }
  
  return amount > 0 ? "Income" : "Other Expense"
}

export async function detectAnomaly(
  transactions: Array<{ amount: number; date: Date; category: string }>
): Promise<Array<{ transaction: any; reason: string }>> {
  const anomalies: Array<{ transaction: any; reason: string }> = []
  
  if (transactions.length === 0) return anomalies
  
  // Calculate average and standard deviation
  const amounts = transactions.map(t => Math.abs(t.amount))
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / amounts.length
  const stdDev = Math.sqrt(variance)
  
  // Flag transactions that are more than 2 standard deviations from the mean
  transactions.forEach(transaction => {
    const amount = Math.abs(transaction.amount)
    if (amount > avg + 2 * stdDev) {
      anomalies.push({
        transaction,
        reason: `Unusually large transaction: ${amount.toFixed(2)} (avg: ${avg.toFixed(2)})`
      })
    }
  })
  
  return anomalies
}

export async function prioritizeTasks(
  tasks: Array<{ dueDate: Date | null; priority: string; status: string }>
): Promise<Array<{ task: any; score: number; suggestion: string }>> {
  const now = new Date()
  const prioritized = tasks
    .filter(t => t.status !== "completed")
    .map(task => {
      let score = 0
      let suggestion = ""
      
      // Priority scoring
      if (task.priority === "urgent") score += 100
      else if (task.priority === "high") score += 50
      else if (task.priority === "medium") score += 25
      else if (task.priority === "low") score += 10
      
      // Due date scoring
      if (task.dueDate) {
        const daysUntilDue = Math.ceil((task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntilDue < 0) {
          score += 200 // Overdue tasks get highest priority
          suggestion = "This task is overdue!"
        } else if (daysUntilDue <= 1) {
          score += 150
          suggestion = "Due today or tomorrow"
        } else if (daysUntilDue <= 3) {
          score += 100
          suggestion = "Due within 3 days"
        } else if (daysUntilDue <= 7) {
          score += 50
          suggestion = "Due within a week"
        }
      }
      
      return { task, score, suggestion }
    })
    .sort((a, b) => b.score - a.score)
  
  return prioritized
}

