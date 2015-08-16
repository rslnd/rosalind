Feature: Inbound Calls

  As an external call center employee
  I want to save notes about incoming calls
  So that the receptionists can schedule appointments

  Background:
    Given I am a new user
    And I am on the dashboard

  Scenario: Create inbound call
    Given I click on 'New inbound call'
    And I fill in 'Last name' with 'Schwarz'
    And I fill in 'First name' with 'Sabine'
    And I fill in 'Telephone' with '0660 123456789'
    And I fill in 'Note' with 'Move appt. for today from 18:00 to 19:00'
    And I click on 'Save new inbound call'
    Then the field 'Last name' should be empty
    Given I click on 'Inbound Calls'
    Then I should see 'Sabine Schwarz'
    And I should see '0660 123456789'
    And I should see 'Move appt. for today from 18:00 to 19:00'
    And I should see the current time

  Scenario: Mark inbound call as resolved
    Given an 'inbound call' with the following attributes:
      | Last name | First name | Telephone | Note | Private Patient |
      | Schwarz   | Lisa       | 123 456   | Test | false           |
    Given I click on 'Inbound Calls'
    Then I should see 'Lisa Schwarz'
    And I should see 'Insurance'
    Given I click on 'Mark as resolved'
    Then I should not see 'Lisa Schwarz'
    And I should see 'No open inbound calls'
