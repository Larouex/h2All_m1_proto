"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import styles from "./MyContribution.module.css"

interface ContributionData {
  claimedBottles: number
  contributedGallons: number
}

interface MyContributionProps {
  email?: string
}

export default function MyContribution({ email }: MyContributionProps) {
  const [data, setData] = useState<ContributionData>({
    claimedBottles: 0,
    contributedGallons: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasEmail, setHasEmail] = useState(false)

  useEffect(() => {
    const fetchContributionData = async () => {
      // Check localStorage if email prop is not provided
      const userEmail = email || localStorage.getItem("userEmail")
      
      if (!userEmail) {
        // Don't show error, just show default values
        setLoading(false)
        setHasEmail(false)
        return
      }

      try {
        setLoading(true)
        setHasEmail(true)
        const response = await fetch(`/api/user/email-impact?email=${encodeURIComponent(userEmail)}`)

        if (!response.ok) {
          throw new Error("Failed to fetch contribution data")
        }

        const contributionData = await response.json()
        setData({
          claimedBottles: contributionData.claimedBottles || 0,
          contributedGallons: contributionData.claimedBottles || 0  // 1:1 with claims
        })
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchContributionData()
  }, [email])

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>My Impact</h2>
        </div>
        <div className={styles.loading}>Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>My Impact</h2>
        </div>
        <div className={styles.error}>Error: {error}</div>
      </div>
    )
  }

  // Don't render the component if there's no email
  if (!hasEmail && !loading) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>My Impact</h2>
        </div>

        <div className={styles.content}>
          <div className={styles.row}>
            <div className={styles.iconContainer}>
              <Image 
                src="/waterbottle.svg" 
                alt="Water Bottle" 
                width={34} 
                height={34}
                className={styles.bottleIcon}
              />
            </div>
            <div className={styles.label}>Claimed Bottles</div>
            <div className={styles.value}>{data.claimedBottles}</div>
          </div>

          <div className={styles.row}>
            <div className={styles.iconContainer}>
              <Image 
                src="/waterdrop.svg" 
                alt="Water Drop" 
                width={11} 
                height={15}
                className={styles.dropIcon}
              />
            </div>
            <div className={styles.label}>Contributed Gallons</div>
            <div className={styles.value}>{data.contributedGallons}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
