Feature: Schedules

  As a manager
  I want to set my employee's working schedules
  So that they can work at full capacity

  Background:
    Given I am a 'manager' with the role 'schedules'
    And I am logged in
    Given a 'group' with the following attributes:
      | name       |
      | A+ Doctors |
    Given a 'user' with the following attributes:
      | username | profile.firstName | profile.employee |
      | db       | Dr. Best          | true             |
    And this user belongs to the group 'A+ Doctors'

  Scenario: View default schedules
    Given I click on 'Schedules > Default Schedules'
    Then I should see 'Dr. Best'
    And I should see 'A+ Doctors'
    And I should see '0h'
