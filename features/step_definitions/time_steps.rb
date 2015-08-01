Angenommen(/^es ist (\d+\:\d+) Uhr$/) do |time|
  Timecop.freeze Chronic.parse(time)
end

Dann(/^sollte ich die aktuelle Uhrzeit sehen$/) do
  page.should have_content I18n.l(Time.current, format: :time)
end

After do
  Timecop.return
end
