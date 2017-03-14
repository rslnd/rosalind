import React from 'react'

export const LinkToAppointment = ({ text, linkText, onClick }) => (
  text &&
    <div className="row">
      <span className="text-muted col-md-12">
        {
          linkText
          ? (
            <span>
              {text}<br />
              <a onClick={onClick}>{linkText}</a>
            </span>
          ) : text
        }
      </span>
      <br />
    </div> || null
)
