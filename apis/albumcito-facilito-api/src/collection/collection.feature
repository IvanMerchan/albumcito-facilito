Feature: Collecting stickers
  As a signed-up user
  I want to add a sticker to my collection
  So that my onboarding is marked complete and I have a personal collection

  Scenario: Adding a valid sticker
    Given I am signed up
    When I add the sticker "cody-aventuras-01" to my collection
    Then the sticker appears in my collection
    And my onboarding is marked as completed

  Scenario: Adding a sticker that does not exist
    Given I am signed up
    When I try to add the sticker "does-not-exist" to my collection
    Then I receive a not found error

  Scenario: Adding the same sticker twice
    Given I am signed up
    And I already added the sticker "cody-aventuras-01" to my collection
    When I add the sticker "cody-aventuras-01" to my collection again
    Then my collection still has exactly one sticker
