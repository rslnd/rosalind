@Search ||= {}
@Search.mappings ||= {}
@Search.mappings.patients =
  properties:
    createdAt:
      type: 'date'
      format: 'strict_date_optional_time||epoch_millis'

    insuranceId:
      type: 'string',
      index: 'not_analyzed'

    note:
      type: 'string'

    profile:
      properties:
        address:
          properties:
            country:
              type: 'string'
              index: 'not_analyzed'

            line1:
              type: 'string'

            line2:
              type: 'string'

            locality:
              type: 'string'

            postalCode:
              type: 'string'

        birthday:
          type: 'date'
          format: 'strict_date_optional_time||epoch_millis'

        contacts:
          properties:
            channel:
              type: 'string',
              index: 'not_analyzed'

            note:
              type: 'string'

            order:
              type: 'long'

            value:
              type: 'string'

        firstName:
          type: 'string'
          copy_to: [
            'profile.fullName'
            'profile.fullNameWithTitle'
            'profile.firstNamePhonetic'
            'profile.firstNameAutocomplete'
            'profile.fullNamePhonetic'
            'profile.fullNameAutocomplete'
            'profile.fullNameWithTitlePhonetic'
            'profile.fullNameWithTitleAutocomplete'
          ]

        firstNameAutocomplete:
          type: 'string'
          analyzer: 'autocomplete'

        firstNamePhonetic:
          type: 'string'
          analyzer: 'phonetic'

        fullName:
          type: 'string'

        fullNameAutocomplete:
          type: 'string'
          analyzer: 'autocomplete'

        fullNamePhonetic:
          type: 'string'
          analyzer: 'phonetic'

        fullNameWithTitle:
          type: 'string'

        fullNameWithTitleAutocomplete:
          type: 'string'
          term_vector: 'yes'
          analyzer: 'autocomplete'

        fullNameWithTitlePhonetic:
          type: 'string'
          term_vector: 'yes'
          analyzer: 'phonetic'

        gender:
          type: 'string'

        lastName:
          type: 'string'
          copy_to: [
            'profile.fullName'
            'profile.fullNameWithTitle'
            'profile.lastNamePhonetic'
            'profile.lastNameAutocomplete'
            'profile.fullNamePhonetic'
            'profile.fullNameAutocomplete'
            'profile.fullNameWithTitlePhonetic'
            'profile.fullNameWithTitleAutocomplete'
          ]

        lastNameAutocomplete:
          type: 'string'
          analyzer: 'autocomplete'

        lastNamePhonetic:
          type: 'string'
          analyzer: 'phonetic'

        titleAppend:
          type: 'string'
          copy_to: [
            'profile.fullNameWithTitle'
            'profile.fullNameWithTitlePhonetic'
            'profile.fullNameWithTitleAutocomplete'
          ]

        titlePrepend:
          type: 'string'
          copy_to: [
            'profile.fullNameWithTitle'
            'profile.fullNameWithTitlePhonetic'
            'profile.fullNameWithTitleAutocomplete'
          ]
