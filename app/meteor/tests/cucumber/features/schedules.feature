Feature: Schedules

  As a manager
  I want to set my employee's working schedules
  So that they can work at full capacity

  Background:
    Given I am a 'manager' with the role 'schedules'
    And I am logged in

  Scenario: View schedules
    Given I click on 'Schedules > Current Schedules'
    Then I should see the current week of the year
