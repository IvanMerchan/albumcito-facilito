Feature: Home page
  As a visitor
  I want to see the Albumcito Facilito home page
  So that I can browse the sticker albums and open one

  Scenario: Viewing the album collection on the home page
    Given there is a "Cody Aventuras" album available
    When I open the home page
    Then I see the "Albumcito Facilito" heading
    And I see the "Cody Aventuras" album card

  Scenario: Choosing an album from the home page
    Given there is a "Cody Aventuras" album available
    When I open the home page
    Then the "Cody Aventuras" album card links to its album page
