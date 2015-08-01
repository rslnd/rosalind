Angenommen(/^ich (?:gehe|klicke) auf "(.*?)"$/) do |link|
  click_on link
end

Angenommen(/^ich gebe bei "(.*?)" "(.*?)" ein$/) do |field, value|
  fill_in field, with: value
end

Dann(/^sollte ich "(.*?)" sehen$/) do |text|
  page.should have_content text
end

Dann(/^sollte bei "(.*?)" nichts stehen$/) do |field|
  find_field(field).value.should be_blank
end
