Feature: Signup
  As a visitor
  I want to create an account with my email, password and name
  So that I can add my first sticker in the same session

  Scenario: Signing up successfully
    Given the signup will succeed for "ivan.merchan@gmail.com"
    When I submit the signup form with name "Iván Merchán", email "ivan.merchan@gmail.com" and password "super-secret"
    Then I am redirected to "/onboarding"

  Scenario: Signing up with an email that is already registered
    Given the signup will fail because the email is already registered
    When I submit the signup form with name "Iván Merchán", email "ivan.merchan@gmail.com" and password "super-secret"
    Then I see the message "Ese correo ya está registrado. Inicia sesión."
