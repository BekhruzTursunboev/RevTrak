"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, Search, Edit, Trash2, DollarSign, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  companyName: string | null
  notes: string | null
  totalDue: number
  totalPaid: number
  payments: Array<{
    id: string
    amount: number
    paymentDate: Date
    notes: string | null
  }>
}

export default function ClientsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    notes: "",
    totalDue: "",
  })
  const [paymentFormData, setPaymentFormData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      const res = await fetch(`/api/clients?${params}`)
      if (res.ok) {
        const data = await res.json()
        setClients(data)
      }
    } catch (error) {
      console.error("Failed to fetch clients", error)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingClient
        ? `/api/clients/${editingClient.id}`
        : "/api/clients"
      const method = editingClient ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          totalDue: formData.totalDue ? parseFloat(formData.totalDue) : 0,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: editingClient
            ? "Client updated"
            : "Client created",
        })
        setDialogOpen(false)
        resetForm()
        fetchClients()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save client")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save client",
        variant: "destructive",
      })
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) return

    try {
      const response = await fetch(`/api/clients/${selectedClient.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentFormData,
          amount: parseFloat(paymentFormData.amount),
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Payment recorded",
        })
        setPaymentDialogOpen(false)
        setPaymentFormData({
          amount: "",
          paymentDate: new Date().toISOString().split("T")[0],
          notes: "",
        })
        fetchClients()
      } else {
        throw new Error("Failed to record payment")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return

    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast({ title: "Success", description: "Client deleted" })
        fetchClients()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      companyName: client.companyName || "",
      notes: client.notes || "",
      totalDue: client.totalDue.toString(),
    })
    setDialogOpen(true)
  }

  const handleAddPayment = (client: Client) => {
    setSelectedClient(client)
    setPaymentDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      companyName: "",
      notes: "",
      totalDue: "",
    })
    setEditingClient(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  const totalOutstanding = clients.reduce(
    (sum, client) => sum + (client.totalDue - client.totalPaid),
    0
  )
  const totalPaid = clients.reduce((sum, client) => sum + client.totalPaid, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Clients</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingClient ? "Edit Client" : "Add Client"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingClient
                      ? "Update client information"
                      : "Add a new client to track payments"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Client Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({ ...formData, companyName: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="totalDue">Total Amount Due</Label>
                    <Input
                      id="totalDue"
                      type="number"
                      step="0.01"
                      value={formData.totalDue}
                      onChange={(e) =>
                        setFormData({ ...formData, totalDue: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Additional information..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalOutstanding)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPaid)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <p className="text-muted-foreground">No clients found</p>
            ) : (
              <div className="space-y-4">
                {clients.map((client) => {
                  const outstanding = client.totalDue - client.totalPaid
                  return (
                    <div
                      key={client.id}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{client.name}</h3>
                            {client.companyName && (
                              <span className="text-sm text-muted-foreground">
                                ({client.companyName})
                              </span>
                            )}
                          </div>
                          {client.email && (
                            <p className="text-sm text-muted-foreground">
                              {client.email}
                            </p>
                          )}
                          {client.phone && (
                            <p className="text-sm text-muted-foreground">
                              {client.phone}
                            </p>
                          )}
                          {client.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {client.notes}
                            </p>
                          )}
                          <div className="mt-3 flex gap-4 text-sm">
                            <div>
                              <span className="font-medium">Total Due: </span>
                              <span className="text-orange-600">
                                {formatCurrency(client.totalDue)}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Paid: </span>
                              <span className="text-green-600">
                                {formatCurrency(client.totalPaid)}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Outstanding: </span>
                              <span
                                className={
                                  outstanding > 0
                                    ? "text-red-600 font-bold"
                                    : "text-green-600"
                                }
                              >
                                {formatCurrency(outstanding)}
                              </span>
                            </div>
                          </div>
                          {client.payments.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-2">
                                Recent Payments:
                              </p>
                              <div className="space-y-1">
                                {client.payments.slice(0, 3).map((payment) => (
                                  <div
                                    key={payment.id}
                                    className="text-xs text-muted-foreground flex justify-between"
                                  >
                                    <span>
                                      {formatDate(payment.paymentDate)} -{" "}
                                      {payment.notes || "No notes"}
                                    </span>
                                    <span className="text-green-600 font-medium">
                                      {formatCurrency(payment.amount)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddPayment(client)}
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Add Payment
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(client)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(client.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent>
            <form onSubmit={handlePaymentSubmit}>
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogDescription>
                  Record a payment from {selectedClient?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="paymentAmount">Amount *</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    value={paymentFormData.amount}
                    onChange={(e) =>
                      setPaymentFormData({
                        ...paymentFormData,
                        amount: e.target.value,
                      })
                    }
                    required
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentDate">Payment Date *</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={paymentFormData.paymentDate}
                    onChange={(e) =>
                      setPaymentFormData({
                        ...paymentFormData,
                        paymentDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentNotes">Notes</Label>
                  <Textarea
                    id="paymentNotes"
                    value={paymentFormData.notes}
                    onChange={(e) =>
                      setPaymentFormData({
                        ...paymentFormData,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Payment details..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPaymentDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Record Payment</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

