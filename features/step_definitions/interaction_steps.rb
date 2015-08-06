Angenommen(/^ich (?:gehe|klicke) auf "(.*?)"$/) do |link|
  click_on link
end

Angenommen(/^ich gebe bei "(.*?)" "(.*?)" ein$/) do |field, value|
  fill_in field, with: value
end

Dann(/^sollte ich "(.*?)" sehen$/) do |text|
  expect(page).to have_content(text)
end

Dann(/^sollte ich nicht (?:mehr)? "(.*?)" sehen$/) do |text|
  expect(page).to_not have_content(text)
end

Dann(/^sollte bei "(.*?)" nichts stehen$/) do |field|
  expect(find_field(field).value).to be_blank
end
