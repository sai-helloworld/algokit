import { useState } from 'react'

interface MethodCallInterface {
  methodFunction: () => Promise<void>
  text: string
}

const MethodCall = ({ methodFunction, text }: MethodCallInterface) => {
  const [loading, setLoading] = useState<boolean>(false)

  const callMethodFunction = async () => {
    setLoading(true)
    try {
      await methodFunction()
    } catch (error) {
      console.error('Error executing method:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button className="btn m-2" onClick={callMethodFunction} disabled={loading}>
      {loading ? <span className="loading loading-spinner" /> : text}
    </button>
  )
}

export default MethodCall
