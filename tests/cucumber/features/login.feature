Feature: Login

  As a business owner
  I want my employees to be able to log in
  So that their time spent working is tracked

  Background:
    Given I am on the dashboard

  Scenario: I have to log in
    Then I should be logged out
    And I should see 'Please log in'
    And I should see 'Name'
    And I should see 'Password'

  Scenario: I cannot log in with incorrect credentials
    Given I fill in 'Name' with 'a wrong username'
    And I fill in 'Password' with 'a wrong password'
    And I submit the form
    Then I should see 'Please log in'
    And I should see 'incorrect'
    And I should be logged out

  Scenario: I can log in with correct credentials
    Given a 'user' with the following attributes:
      | username   | password | email            |
      | callcenter | abcd     | test@example.com |
    And I fill in 'Name' with 'callcenter'
    And I fill in 'Password' with 'abcd'
    And I submit the form
    Then I should be logged in
