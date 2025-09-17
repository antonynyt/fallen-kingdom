export const gameData = {
  npcs: [
    {
      id: 'farmer_john',
      name: 'John the Farmer',
      role: 'Peasant',
      image: '/images/characters/farmer.svg',
      background: '/images/backgrounds/farmland.svg',
      baseComplaint: 'The taxes are crushing us, Your Majesty! We can barely feed our families.',
      dialogue: 'Your Majesty, I come before you with a heavy heart. The tax collectors have taken nearly everything we harvested this season. My children go to bed hungry while the nobles feast in their castles. Please, show mercy to your people!',
      choices: [
        {
          text: 'Reduce taxes by half for peasants',
          consequence: 'The peasants cheer your name, but the treasury suffers',
          popularityChange: 10,
          type: 'merciful'
        },
        {
          text: 'Maintain current taxes for kingdom stability',
          consequence: 'The farmer leaves disappointed, but the nobles approve',
          popularityChange: -5,
          type: 'neutral'
        },
        {
          text: 'Increase taxes to fund military expansion',
          consequence: 'The farmer protests, and word spreads of your cruelty',
          popularityChange: -15,
          type: 'harsh'
        }
      ],
      relationships: []
    },
    {
      id: 'merchant_elena',
      name: 'Elena the Merchant',
      role: 'Burgher',
      image: '/images/characters/merchant.svg',
      background: '/images/backgrounds/marketplace.svg',
      baseComplaint: 'Bandits plague the trade routes, killing commerce!',
      dialogue: 'Your Majesty, the trade routes are no longer safe! Bandits attack our caravans daily. My last shipment was completely lost, and three of my guards were killed. Without safe passage, commerce will die, and with it, the prosperity of your kingdom!',
      choices: [
        {
          text: 'Deploy royal guards to patrol trade routes',
          consequence: 'Trade flourishes, but military resources are stretched thin',
          popularityChange: 8,
          type: 'protective'
        },
        {
          text: 'Hire mercenaries to clear the roads',
          consequence: 'Roads become safer, but it costs a fortune',
          popularityChange: 5,
          type: 'neutral'
        },
        {
          text: 'Tell merchants to hire their own protection',
          consequence: 'Elena is outraged, and trade begins to suffer',
          popularityChange: -12,
          type: 'dismissive'
        }
      ],
      relationships: [
        {
          affectedBy: ['farmer_john'],
          modifier: 'If you helped the farmer, Elena worries about increased taxes'
        }
      ]
    },
    {
      id: 'lord_blackwood',
      name: 'Lord Blackwood',
      role: 'Noble',
      image: '/images/characters/noble.svg',
      background: '/images/backgrounds/castle_hall.svg',
      baseComplaint: 'The kingdom needs stronger leadership and order!',
      dialogue: 'Your Majesty, I speak for many of the noble houses when I say that the realm requires... firmer guidance. The peasants grow restless, merchants complain constantly, and our enemies sense weakness. Perhaps it is time for more... experienced leadership?',
      choices: [
        {
          text: 'Assert your authority and dismiss his concerns',
          consequence: 'Blackwood retreats, but plots against you in the shadows',
          popularityChange: -8,
          type: 'defiant'
        },
        {
          text: 'Ask for his counsel and support',
          consequence: 'Blackwood smiles, but your independence is questioned',
          popularityChange: 3,
          type: 'diplomatic'
        },
        {
          text: 'Threaten him with treason charges',
          consequence: 'He backs down, but other nobles grow fearful',
          popularityChange: -10,
          type: 'threatening'
        }
      ],
      relationships: [
        {
          affectedBy: ['farmer_john', 'merchant_elena'],
          modifier: 'Reacts to how you handled economic issues'
        }
      ],
      minTurn: 3
    },
    {
      id: 'priest_marcus',
      name: 'Father Marcus',
      role: 'Clergy',
      image: '/images/characters/priest.svg',
      background: '/images/backgrounds/cathedral.svg',
      baseComplaint: 'The church needs more support for the faithful',
      dialogue: 'Bless you, Your Majesty. I come seeking aid for the church and its flock. Our granaries are empty, our walls crumble, and the faithful lose hope. The previous king promised reforms that never came. Will you honor the sacred bond between crown and church?',
      choices: [
        {
          text: 'Donate generously to the church',
          consequence: 'The faithful praise you, but the treasury dwindles',
          popularityChange: 12,
          type: 'generous'
        },
        {
          text: 'Promise future support when possible',
          consequence: 'Marcus accepts reluctantly, hoping for better times',
          popularityChange: 2,
          type: 'diplomatic'
        },
        {
          text: 'Suggest the church should be self-sufficient',
          consequence: 'The priest is shocked, and religious unrest begins',
          popularityChange: -15,
          type: 'secular'
        }
      ],
      relationships: []
    },
    {
      id: 'captain_steel',
      name: 'Captain Steel',
      role: 'Military',
      image: '/images/characters/captain.svg',
      background: '/images/backgrounds/barracks.svg',
      baseComplaint: 'The army lacks equipment and morale is low',
      dialogue: 'Your Majesty, I must speak plainly. Our soldiers fight with rusty swords and broken shields. Morale is at its lowest point in decades. Men desert daily, and those who remain question whether the crown truly supports them. We need resources, and we need them now.',
      choices: [
        {
          text: 'Increase military funding immediately',
          consequence: 'The army cheers, but other sectors suffer budget cuts',
          popularityChange: 8,
          type: 'military'
        },
        {
          text: 'Promise gradual improvements over time',
          consequence: 'Steel accepts, but requests written guarantees',
          popularityChange: 1,
          type: 'gradual'
        },
        {
          text: 'Tell him to make do with current resources',
          consequence: 'Steel salutes coldly, and army loyalty wavers',
          popularityChange: -10,
          type: 'dismissive'
        }
      ],
      relationships: [
        {
          affectedBy: ['merchant_elena'],
          modifier: 'If bandits remain unchecked, Steel is more urgent'
        }
      ]
    },
    {
      id: 'witch_morgana',
      name: 'Morgana the Wise',
      role: 'Mystic',
      image: '/images/characters/witch.svg',
      background: '/images/backgrounds/forest.svg',
      baseComplaint: 'The people fear magic and persecute the gifted',
      dialogue: 'Young king, I emerge from the shadows to warn you. Magic users are hunted like animals in your realm. Yet we have served the crown faithfully for generations. Continue this persecution, and you will lose powerful allies when dark times come... and they are coming.',
      choices: [
        {
          text: 'Protect magic users and grant them sanctuary',
          consequence: 'Mystics pledge loyalty, but religious leaders object',
          popularityChange: 5,
          type: 'progressive'
        },
        {
          text: 'Maintain the current cautious stance',
          consequence: 'Morgana nods knowingly and vanishes into mist',
          popularityChange: 0,
          type: 'neutral'
        },
        {
          text: 'Ban all magic and exile practitioners',
          consequence: 'Morgana curses you before disappearing forever',
          popularityChange: -8,
          type: 'oppressive'
        }
      ],
      relationships: [
        {
          affectedBy: ['priest_marcus'],
          modifier: 'Church support affects magical persecution'
        }
      ],
      minTurn: 5
    },
    {
      id: 'orphan_tim',
      name: 'Little Tim',
      role: 'Child',
      image: '/images/characters/orphan.svg',
      background: '/images/backgrounds/slums.svg',
      baseComplaint: 'The orphanage is overcrowded and we are starving',
      dialogue: 'P-please, Your Majesty... I speak for all the children with no families. The orphanage is so crowded we sleep on the floor. Sister Mary tries her best, but there is never enough food. Many of us get sick and... and some do not get better. Could you please help us?',
      choices: [
        {
          text: 'Establish a royal fund for orphaned children',
          consequence: 'Children across the realm bless your name',
          popularityChange: 15,
          type: 'compassionate'
        },
        {
          text: 'Ask wealthy nobles to sponsor orphanages',
          consequence: 'Some help comes, but it is not nearly enough',
          popularityChange: 5,
          type: 'delegated'
        },
        {
          text: 'Suggest orphans work as apprentices for their keep',
          consequence: 'Tim looks heartbroken as he shuffles away',
          popularityChange: -12,
          type: 'harsh'
        }
      ],
      relationships: [
        {
          affectedBy: ['priest_marcus'],
          modifier: 'Church support helps with orphan care'
        }
      ]
    },
    {
      id: 'ambassador_valdris',
      name: 'Ambassador Valdris',
      role: 'Diplomat',
      image: '/images/characters/ambassador.svg',
      background: '/images/backgrounds/embassy.svg',
      baseComplaint: 'Neighboring kingdoms question your legitimacy',
      dialogue: 'Your Majesty, I bring word from the Council of Kingdoms. Your neighboring rulers question the legitimacy of your claim to the throne. They speak of intervention to "restore proper order." We must act swiftly to secure alliances, or face potential invasion.',
      choices: [
        {
          text: 'Offer trade agreements and diplomatic marriages',
          consequence: 'Foreign relations improve, but at great cost',
          popularityChange: 7,
          type: 'diplomatic'
        },
        {
          text: 'Display military strength to deter aggression',
          consequence: 'Neighbors respect your power but remain wary',
          popularityChange: 3,
          type: 'military'
        },
        {
          text: 'Ignore their threats and focus on internal affairs',
          consequence: 'Valdris warns of dire consequences to come',
          popularityChange: -5,
          type: 'isolationist'
        }
      ],
      relationships: [
        {
          affectedBy: ['captain_steel', 'lord_blackwood'],
          modifier: 'Military and noble support affects diplomatic standing'
        }
      ],
      minTurn: 6
    },
    {
      id: 'healer_anne',
      name: 'Anne the Healer',
      role: 'Physician',
      image: '/images/characters/healer.svg',
      background: '/images/backgrounds/infirmary.svg',
      baseComplaint: 'A plague threatens to spread through the kingdom',
      dialogue: 'Your Majesty, I fear I bring terrible news. A plague has begun in the eastern villages. I have seen this disease before - it spreads quickly and kills without mercy. We need immediate action: quarantine, supplies, and healers, or it will consume the entire kingdom.',
      choices: [
        {
          text: 'Implement full quarantine and fund healing efforts',
          consequence: 'The plague is contained, but the economy suffers',
          popularityChange: 12,
          type: 'protective'
        },
        {
          text: 'Send limited aid while maintaining trade',
          consequence: 'Some areas are saved, but the disease spreads',
          popularityChange: 2,
          type: 'balanced'
        },
        {
          text: 'Keep the information secret to avoid panic',
          consequence: 'Anne is horrified, and the plague spreads unchecked',
          popularityChange: -20,
          type: 'secretive'
        }
      ],
      relationships: [
        {
          affectedBy: ['merchant_elena'],
          modifier: 'Trade route security affects plague spread'
        }
      ],
      minTurn: 7
    },
    {
      id: 'blacksmith_garon',
      name: 'Garon the Smith',
      role: 'Craftsman',
      image: '/images/characters/blacksmith.svg',
      background: '/images/backgrounds/forge.svg',
      baseComplaint: 'Guilds are being undermined by cheap foreign goods',
      dialogue: 'Your Majesty, the guilds that built this kingdom are dying! Foreign merchants flood our markets with cheap, poorly-made goods. Our craftsmen, who have served the crown for generations, can no longer compete. Soon, all quality craftsmanship will be lost forever.',
      choices: [
        {
          text: 'Impose tariffs on foreign goods to protect guilds',
          consequence: 'Guilds thrive, but foreign relations deteriorate',
          popularityChange: 8,
          type: 'protectionist'
        },
        {
          text: 'Encourage guilds to improve and innovate',
          consequence: 'Garon appreciates the challenge but asks for time',
          popularityChange: 3,
          type: 'reformist'
        },
        {
          text: 'Let the market decide what succeeds',
          consequence: 'Garon storms out, and guild support crumbles',
          popularityChange: -10,
          type: 'laissez-faire'
        }
      ],
      relationships: [
        {
          affectedBy: ['merchant_elena', 'ambassador_valdris'],
          modifier: 'Trade and diplomatic policies affect guild concerns'
        }
      ]
    },
    {
      id: 'scholar_livia',
      name: 'Scholar Livia',
      role: 'Academic',
      image: '/images/characters/scholar.svg',
      background: '/images/backgrounds/library.svg',
      baseComplaint: 'Knowledge and learning are being neglected',
      dialogue: 'Your Majesty, the great libraries crumble while ignorance spreads like wildfire. Books rot, scholars flee to other lands, and superstition replaces wisdom. A kingdom that abandons learning abandons its future. Will you be the king who lets knowledge die?',
      choices: [
        {
          text: 'Establish royal academies and fund research',
          consequence: 'Scholars praise you, but immediate needs go unmet',
          popularityChange: 6,
          type: 'progressive'
        },
        {
          text: 'Focus on practical education for common folk',
          consequence: 'Livia accepts, though she hoped for more',
          popularityChange: 4,
          type: 'practical'
        },
        {
          text: 'Prioritize immediate needs over academic pursuits',
          consequence: 'Livia predicts dark times ahead for the kingdom',
          popularityChange: -7,
          type: 'pragmatic'
        }
      ],
      relationships: [
        {
          affectedBy: ['witch_morgana', 'priest_marcus'],
          modifier: 'Religious and magical policies affect scholarly pursuits'
        }
      ]
    },
    {
      id: 'spy_master_crow',
      name: 'The Crow',
      role: 'Spymaster',
      image: '/images/characters/spy.svg',
      background: '/images/backgrounds/shadows.svg',
      baseComplaint: 'Enemies plot against you from within and without',
      dialogue: 'Your Majesty... I bring whispers from the shadows. Lord Blackwood conspires with foreign agents. Assassins move through your halls. The church harbors dissidents. Trust no one completely, for treachery lurks in every smile. Give me authority to act, or watch your reign crumble.',
      choices: [
        {
          text: 'Grant extensive powers to root out traitors',
          consequence: 'Security improves, but fear grips the kingdom',
          popularityChange: -5,
          type: 'authoritarian'
        },
        {
          text: 'Ask for evidence before taking action',
          consequence: 'The Crow provides proof, but warns of delays',
          popularityChange: 1,
          type: 'cautious'
        },
        {
          text: 'Reject paranoid accusations and surveillance',
          consequence: 'The Crow vanishes, taking his secrets with him',
          popularityChange: -3,
          type: 'trusting'
        }
      ],
      relationships: [
        {
          affectedBy: ['lord_blackwood', 'priest_marcus', 'ambassador_valdris'],
          modifier: 'Previous political choices affect security concerns'
        }
      ],
      minTurn: 9
    },
    {
      id: 'bard_felix',
      name: 'Felix the Bard',
      role: 'Entertainer',
      image: '/images/characters/bard.svg',
      background: '/images/backgrounds/tavern.svg',
      baseComplaint: 'The people lose hope and need inspiration',
      dialogue: 'Your Majesty, I travel the realm and hear the people sing... but their songs have grown dark. They speak of hunger, fear, and lost hope. A kingdom without joy is a kingdom without soul. The people need something to believe in, some reason to smile again.',
      choices: [
        {
          text: 'Organize grand festivals and celebrations',
          consequence: 'Joy returns to the realm, but resources are spent',
          popularityChange: 10,
          type: 'inspiring'
        },
        {
          text: 'Commission songs celebrating royal victories',
          consequence: 'Felix spreads your fame, though some call it vanity',
          popularityChange: 5,
          type: 'promotional'
        },
        {
          text: 'Tell people to find their own reasons to be happy',
          consequence: 'Felix sadly strums a melancholy tune and leaves',
          popularityChange: -8,
          type: 'dismissive'
        }
      ],
      relationships: [
        {
          affectedBy: ['farmer_john', 'orphan_tim', 'healer_anne'],
          modifier: 'How you handled common peoples concerns affects morale'
        }
      ]
    },
    {
      id: 'old_king_ghost',
      name: 'Ghost of the Old King',
      role: 'Supernatural',
      image: '/images/characters/ghost.svg',
      background: '/images/backgrounds/throne_room_night.svg',
      baseComplaint: 'You must prove worthy of the crown I left behind',
      dialogue: 'My heir... I have watched from beyond the veil as you struggle with the burden I left you. The crown is heavy, is it not? You have made choices I would not have made... but perhaps that is for the best. Tell me, do you believe yourself worthy of the throne?',
      choices: [
        {
          text: 'I have learned from my mistakes and grown stronger',
          consequence: 'The ghost nods approvingly and grants his blessing',
          popularityChange: 8,
          type: 'humble'
        },
        {
          text: 'I am doing the best I can in difficult times',
          consequence: 'The ghost understands but warns of challenges ahead',
          popularityChange: 3,
          type: 'realistic'
        },
        {
          text: 'I need no approval from the dead',
          consequence: 'The ghost frowns and warns of a cursed reign',
          popularityChange: -10,
          type: 'arrogant'
        }
      ],
      relationships: [
        {
          affectedBy: ['lord_blackwood', 'spy_master_crow'],
          modifier: 'Political stability affects spiritual legitimacy'
        }
      ],
      minTurn: 12
    },
    {
      id: 'dragon_envoy',
      name: 'Draconic Envoy',
      role: 'Mythical',
      image: '/images/characters/dragon.svg',
      background: '/images/backgrounds/mountain.svg',
      baseComplaint: 'Ancient treaties have been broken',
      dialogue: 'Mortal king... the Great Dragons have slumbered long, but your realm has grown bold. Miners dig too deep into our sacred mountains. Hunters slay our lesser kin. The ancient treaties your ancestors signed lie broken. Restore the old ways, or face our wrath.',
      choices: [
        {
          text: 'Honor the ancient treaties and restrict mining',
          consequence: 'Dragons remain peaceful, but economic growth slows',
          popularityChange: 5,
          type: 'respectful'
        },
        {
          text: 'Negotiate new terms for coexistence',
          consequence: 'Dragons agree reluctantly to limited compromise',
          popularityChange: 2,
          type: 'diplomatic'
        },
        {
          text: 'Reject draconic demands and assert human dominance',
          consequence: 'The envoy breathes smoke and promises destruction',
          popularityChange: -15,
          type: 'defiant'
        }
      ],
      relationships: [
        {
          affectedBy: ['blacksmith_garon', 'merchant_elena'],
          modifier: 'Economic policies affect dragon territory conflicts'
        }
      ],
      minTurn: 13
    }
  ]
}
