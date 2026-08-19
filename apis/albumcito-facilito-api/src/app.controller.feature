Feature: Root greeting
  As an API consumer
  I want to fetch the root endpoint
  So that I know the service is alive

  Scenario: Requesting the root greeting
    Given the app controller is ready
    When I request the root greeting
    Then I receive "Hello World!"
