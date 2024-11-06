import { useState } from 'react'

interface MethodCallInterface {
  methodFunction: () => Promise<void>
  text: string
}

const MethodCall = ({ methodFunction, text }: MethodCallInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const callMethodFunction = async () => {
    setLoading(true)
    setError(null) // Clear any previous errors
    try {
      await methodFunction()
    } catch (err) {
      setError('An error occurred while calling the method.')
      console.error(err) // Log the actual error to the console for debugging
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button data-test-id="escrow-method-call" className="btn m-2" onClick={callMethodFunction} disabled={loading}>
        {loading ? <span className="loading loading-spinner" /> : text}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}

export default MethodCall
