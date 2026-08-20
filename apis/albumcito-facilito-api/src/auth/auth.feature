Feature: Signing up and logging in
  As a visitor
  I want to create an account and log in with it
  So that I can access my own dashboard

  Scenario: Signing up with a new email
    Given no account is registered for "ivan.merchan@gmail.com"
    When I sign up with email "ivan.merchan@gmail.com", password "super-secret" and name "Iván Merchán"
    Then I receive an access token for username "ivan-merchan"

  Scenario: Signing up with an email that is already registered
    Given an account already exists for "ivan.merchan@gmail.com"
    When I sign up again with email "ivan.merchan@gmail.com"
    Then I receive an email already registered error

  Scenario: Logging in with the correct password
    Given an account already exists for "ivan.merchan@gmail.com" with password "super-secret"
    When I log in with email "ivan.merchan@gmail.com" and password "super-secret"
    Then I receive an access token for username "ivan-merchan"

  Scenario: Logging in with the wrong password
    Given an account already exists for "ivan.merchan@gmail.com" with password "super-secret"
    When I log in with email "ivan.merchan@gmail.com" and password "wrong-password"
    Then I receive an invalid credentials error
