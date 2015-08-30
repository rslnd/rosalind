Tracker.autorun((t) => {
  try {
    UserStatus.startMonitor({
      threshold: 30 * 1000,
      idleOnBlur: false
    });
    t.stop();
  } catch(e) {}
});
