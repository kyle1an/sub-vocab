export function useTabActive() {
  const [isTabActive, setIsTabActive] = useState(false)

  const handleVisibilityChange = useCallback(() => {
    setIsTabActive(document.visibilityState === 'visible')
  }, [setIsTabActive])

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [handleVisibilityChange])

  return isTabActive
}
