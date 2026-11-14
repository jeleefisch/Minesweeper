import { useEffect } from 'react'

let lockCount = 0

const unlockBody = () => {
  lockCount = 0
  document.body?.classList.remove('modal-open')
}

if (typeof document !== 'undefined') unlockBody()

export default function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) {
      if (lockCount === 0) unlockBody()
      return undefined
    }

    lockCount += 1
    document.body.classList.add('modal-open')
    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) document.body.classList.remove('modal-open')
    }
  }, [locked])
}
