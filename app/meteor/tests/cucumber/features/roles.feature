Feature: Roles

  As a manager
  I want to be able to define roles for my employees' user accounts
  So that they can only do what they should

  Background:
    Given I am on the dashboard

  Scenario: Admins can manage users
    Given I am a 'manager' with the role 'admin'
    And I am logged in
    Then I should see 'Manage users'

  Scenario: Employees cannot manage users
    Given I am a 'employee' with the role 'inboundCalls'
    And I am logged in
    Then I should not see 'Manage users'
