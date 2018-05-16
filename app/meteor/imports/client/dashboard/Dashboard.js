import React from 'react'
import { Link } from 'react-router-dom'
import { __ } from '../../i18n'
import { Counts } from 'meteor/tmeasday:publish-counts'

export const Dashboard = () => (
  <div className='content'>
    <div className='row'>
      <div className='col-md-6 col-sm-12'>
        <Link to='/inboundCalls'>
          <div className='info-box'>
            <span className='info-box-icon bg-green'>
              <i className='fa fa-phone' />
            </span>
            <div className='info-box-content'>
              <span className='info-box-text'>{__('inboundCalls.this')}</span>
              <span className='info-box-number'>{Counts.get('inboundCalls')}</span>
            </div>
          </div>
        </Link>
      </div>

      <div className='col-md-6 col-sm-12'>
        <Link to='/inboundCalls/new'>
          <div className='info-box'>
            <span className='info-box-icon bg-yellow'>
              <i className='fa fa-plus' />
            </span>
            <div className='info-box-content'>
              <span className='info-box-text'>{__('inboundCalls.thisInsert')}</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  </div>
)
