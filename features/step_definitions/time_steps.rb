Angenommen(/^es ist (\d+\:\d+) Uhr$/) do |time|
  Timecop.travel Chronic.parse(time)
end

Dann(/^sollte ich die aktuelle Uhrzeit sehen$/) do
  expect(page).to have_content I18n.l(Time.current, format: :time)
end

After do
  Timecop.return
end
