FastGettext.add_text_domain 'app', path: 'locale', type: :po
FastGettext.default_text_domain = 'app'
FastGettext.default_available_locales = ['at']

# Prefer Gettext i18n over YAML i18n
class GetttextFormtasticLocalizer < Formtastic::Localizer
  def localize(key, value, type, options = {})
    if type.eql?(:label)
      _([builder.model_name, key.to_s.humanize].join('|'))
    else
      super(key, value, type, options)
    end
  end
end

Formtastic::FormBuilder.i18n_lookups_by_default = false
Formtastic::FormBuilder.i18n_localizer = GetttextFormtasticLocalizer
