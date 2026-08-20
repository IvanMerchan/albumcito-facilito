Feature: Login
  As a registered user
  I want to log in with my email and password
  So that I can reach my own dashboard

  Scenario: Logging in with the correct password
    Given the login will succeed for "ivan.merchan@gmail.com"
    When I submit the login form with email "ivan.merchan@gmail.com" and password "super-secret"
    Then I am redirected to "/dashboard/ivan-merchan"

  Scenario: Logging in with the wrong password
    Given the login will fail because the password is wrong
    When I submit the login form with email "ivan.merchan@gmail.com" and password "wrong-password"
    Then I see the message "Correo o contraseña incorrectos."
