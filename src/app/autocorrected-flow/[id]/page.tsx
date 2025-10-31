"use client"

import dynamic from "next/dynamic"
const TransactionViewer = dynamic(() => import("@/components/TransactionViewer"), {
  ssr: false,
})

import { useEffect, useState } from "react"
import { use } from "react"
import { Alert, Spin } from "antd"
import { ThemeProvider } from "next-themes"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function AutocorrectedDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        const response = await fetch(
          `https://server-1-xk8a.onrender.com/api/paymentFile/${resolvedParams.id}`
        )
        if (!response.ok) {
          throw new Error("Failed to fetch transaction details")
        }
        const data = await response.json()
        console.log('API Response:', data)
        // Set transaction with the paymentFile object from the response
        if (data.paymentFile) {
          setTransaction({
            ...data.paymentFile,
            fileStatus: "Auto Corrected",
            bankConfigurations: data.bankConfigurations || [],
            customerConfigurations: data.customerConfigurations || []
          })
        } else {
          throw new Error("Invalid response format")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchTransactionDetails()
  }, [resolvedParams.id])

  const content = (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {loading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <Spin>
            <div className="p-8">
              <div className="text-center mt-4">Loading transaction details...</div>
            </div>
          </Spin>
        </div>
      ) : error ? (
        <div className="p-4">
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
          />
        </div>
      ) : !transaction ? (
        <div className="p-4">
          <Alert
            message="Transaction Not Found"
            description="The requested transaction could not be found."
            type="warning"
            showIcon
          />
        </div>
      ) : (
        <TransactionViewer transaction={transaction} />
      )}
    </ThemeProvider>
  )

  return content
}
