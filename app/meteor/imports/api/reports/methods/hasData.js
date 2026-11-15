// A day without any admitted appointment (closed day, weekend) has nothing to
// report; sending an all-zero e-mail would only be noise.
export const hasData = (statistics = {}) => {
  const total = (statistics.current && statistics.current.total) || {}
  return (total.admitted || 0) > 0
}
