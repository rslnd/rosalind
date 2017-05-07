import React from 'react'
import { Link } from 'react-router-dom'
import { TAPi18n } from 'meteor/tap:i18n'
import { Counts } from 'meteor/tmeasday:publish-counts'

export const Dashboard = () => (
  <div className="content">
    <div className="row">
      <div className="col-md-6 col-sm-12">
        <Link to="/inboundCalls">
          <div className="info-box">
            <span className="info-box-icon bg-green">
              <i className="fa fa-phone"></i>
            </span>
            <div className="info-box-content">
              <span className="info-box-text">{TAPi18n.__('inboundCalls.this')}</span>
              <span className="info-box-number">{Counts.get('inboundCalls')}</span>
            </div>
          </div>
        </Link>
      </div>

      <div className="col-md-6 col-sm-12">
        <Link to="/inboundCalls/new">
          <div className="info-box">
            <span className="info-box-icon bg-yellow">
              <i className="fa fa-plus"></i>
            </span>
            <div className="info-box-content">
              <span className="info-box-text">{TAPi18n.__('inboundCalls.thisInsert')}</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  </div>
)
