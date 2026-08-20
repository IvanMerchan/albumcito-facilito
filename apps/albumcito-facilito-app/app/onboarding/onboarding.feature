Feature: Onboarding
  As a newly signed-up user
  I want to add my first sticker to my collection
  So that I land on my dashboard with something in it

  Scenario: Adding my first sticker
    Given I have a session
    When I add the sticker "cody-aventuras-01" to my collection
    Then I am redirected to my dashboard

  Scenario: Trying to add a sticker without a session
    Given I have no session
    When I try to add the sticker "cody-aventuras-01" to my collection
    Then I am redirected to "/login"
