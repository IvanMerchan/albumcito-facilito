Feature: Browsing albums and their Cody stickers
  As a visitor
  I want to list the available sticker albums and open one
  So that I can see the Cody stickers it contains

  Scenario: Listing the available albums
    Given the albums API is ready
    When I request the list of albums
    Then I receive a summary for each seeded album

  Scenario: Opening an album shows its Cody stickers
    Given the albums API is ready
    When I request the album "cody-aventuras"
    Then I receive its details including every Cody sticker

  Scenario: Requesting an album that does not exist
    Given the albums API is ready
    When I request the album "does-not-exist"
    Then I receive a not found error
