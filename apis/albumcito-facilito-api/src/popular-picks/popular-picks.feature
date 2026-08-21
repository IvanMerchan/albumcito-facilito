Feature: Popular picks
  As a visitor
  I want to see which albums and stickers are most collected
  So that I get social proof of what other people are collecting

  Scenario: Albums ranked by real collection counts
    Given "cody-aventuras" has been collected twice and "cody-espacio" once
    When I request the popular albums
    Then I see "cody-aventuras" ranked above "cody-espacio"

  Scenario: Tied album counts break by catalog order
    Given "cody-espacio" and "cody-oceano" have each been collected once
    When I request the popular albums
    Then I see "cody-espacio" ranked above "cody-oceano"

  Scenario: Stickers ranked by real collection counts
    Given the sticker "cody-aventuras-01" has been collected twice and "cody-aventuras-02" once
    When I request the popular stickers
    Then I see "cody-aventuras-01" ranked above "cody-aventuras-02"

  Scenario: No collection data yet
    Given nobody has collected any sticker
    When I request the popular albums and the popular stickers
    Then both lists are empty
