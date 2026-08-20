Feature: Album detail
  As a visitor
  I want to open an album
  So that I can see all of its Cody stickers and which ones I own

  Scenario: Viewing the Cody stickers of an album
    Given the "Cody Aventuras" album has 3 Cody stickers
    When I view the sticker grid for that album
    Then I see every Cody sticker of the album
