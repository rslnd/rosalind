Angenommen(/^es existiert folgender? .+ \(([A-Za-z]+)\):?$/) do |class_name, attributes|
  klass = class_name.singularize.gsub(/\s/, '').classify.constantize
  klass.create!(attributes.hashes)
end
