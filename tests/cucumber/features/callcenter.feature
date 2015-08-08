Feature: Callcenter

  As an external call center employee
  I want to save notes about incoming calls
  So that the receptionists can schedule appointments

  Background:
    Given I am a new user
    And I am on the dashboard

  @dev
  Scenario: New Call
    Given I click on "New Call"
    And I fill in "Last Name" with "Schwarz"
    And I fill in "First Name" with "Sabine"
    And I fill in "Telephone" with "0660 123456789"
    And I fill in "Notes" with "Move appt. for today from 18:00 to 19:00"
    And I click on "Save Call"
    Then the field "Last name" should be empty
    Given I click on "Open Calls"
    Then I should see "Sabine Schwarz"
    And I should see "0660 123456789"
    And I should see "Move appt. for today from 18:00 to 19:00"
    And I should see "16:00"
