import { useEffect, useCallback, useRef } from 'react'
import throttle from 'lodash/throttle'

// https://stackoverflow.com/a/62017005
export const useThrottle = (cb, delay, options = {leading: false, trailing: true}) => {
  const cbRef = useRef(cb)
  // use mutable ref to make useCallback/throttle not depend on `cb` dep
  useEffect(() => { cbRef.current = cb; })
  return useCallback(
    throttle((...args) => cbRef.current(...args), delay, options),
    [delay]
  )
}
