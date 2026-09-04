export type Block =
  | {
      type: "heading";
      text: string;
      level?: 2 | 3;
    }
  | {
      type: "paragraphs";
      items: string[];
    }
  | {
      type: "list";
      items: string[];
      variant?: "bullet" | "numbered";
    }
  | {
      type: "section";
      heading: string;
      paragraphs?: string[];
      list?: string[];
      listVariant?: "bullet" | "numbered";
    }
  | {
      type: "cta";
      title?: string;
      text?: string;
      buttonText?: string;
      buttonHref?: string;
    };

export interface StairliftLocationContent {
  heading: string;
  blocks: Block[];
}

export const stairliftLocations: Record<
  string,
  StairliftLocationContent
> = {
    Burlington: {
    heading: "Stairlifts in Burlington: A Safer Way to Handle the Stairs",

    blocks: [
      {
        type: "paragraphs",
        items: [
          "A lot of people in Burlington reach a point where the stairs stop being easy. Maybe it's arthritis, maybe it's a knee replacement, maybe it's just age catching up. Whatever the reason, a stairlift is usually faster and less disruptive than moving bedrooms downstairs or selling the house.",
          "A stairlift in Burlington isn't a big renovation. It mounts to the treads of your staircase, not the wall, so there's no drywall work and no structural changes involved. Most units fold up against the rail when not in use, so the stairs stay clear for everyone else in the house.",
        ],
      },

      {
        type: "heading",
        text: "This matters for a few different groups:",
      },

      {
        type: "list",
        items: [
          "Seniors who want to keep living independently.",
          "People recovering from surgery, who need safe stairs during recovery.",
          "Family caregivers who worry about a parent or spouse falling when nobody's around.",
        ],
      },

      {
        type: "paragraphs",
        items: [
          "Burlington homes vary a lot, from straight staircases in newer builds around Millcroft to older, split-level layouts in Aldershot and Roseland. That range means no two installs look exactly the same, and it's part of why we assess every staircase in person before recommending anything.",
          "We handle the full job ourselves, from measuring your stairs to the final setup. We don't consider the job done until you're comfortable using the lift on your own.",
        ],
      },

      {
        type: "section",
        heading: "Straight or Curved?",
        paragraphs: [
          "Most staircases fall into one of two categories. Straight stairs need a single, uninterrupted rail and usually install in a few hours. Staircases with a curve need a custom-built rail, measured to your exact stairs. We tell you which one you need during the consultation, not after the quote arrives.",
        ],
      },

      {
        type: "section",
        heading: "What Happens on Installation Day",
        list: [
          "Our technician arrives with the rail and lift as per your measurements.",
          "The rail is secured directly to the stair treads, no wall work needed.",
          "The lift is tested up and down the full staircase.",
          "You get a walkthrough of the controls and mechanism before we leave.",
        ],
      },
    ],
  },

  Oakville: {
    heading: "Safe & Affordable Stairlifts in Oakville",

    blocks: [
      {
        type: "paragraphs",
        items: [
          "Oakville has a lot of older, multi-level homes. You'll find them in Old Oakville, Bronte, Glen Abbey, and River Oaks. These homes have character, but stairs can turn into a real problem as you get older or deal with an injury. A stairlift solves that. You keep full use of your home without moving out or tearing up your staircase for a renovation.",
          "Medtrion provides quality stairlifts at affordable rates. You get a lift built to last, chosen to fit your staircase and your budget, and it's yours from day one.",
        ],
      },

      {
        type: "heading",
        text: "Here's what we install:",
      },

      {
        type: "list",
        items: [
          "Straight stairlifts: These work on regular, single-flight staircases. Most go in within a few hours, and there's very little mess.",
          "Curved stairlifts: Built for staircases with bends, turns, or landings. Each one is measured and made to fit your exact stairs.",
          "Outdoor stairlifts: Weatherproofed for porches, decks, and outdoor steps. Your mobility doesn't have to stop at the front door.",
        ],
      },

      {
        type: "paragraphs",
        items: [
          "Every job starts the same way. We come to your home for a free consultation. We look at your stairs, talk through your options, and give you a straight answer on what fits your budget. Then our team handles the install from start to finish. No stress, no guesswork on your end.",
        ],
      },

      {
        type: "section",
        heading: "What Sets Our Service Apart",
        list: [
          "Free, no-pressure consultation",
          "Professional installation and support",
          "Trusted stairlift options for different homes",
        ],
      },

      {
        type: "section",
        heading: "Oakville Neighbourhoods We Cover",
        paragraphs: [
          "We work all over Oakville, from the older streets near the lake to newer homes in Glen Abbey. We install stairlifts in narrow century-home staircases and wide modern ones alike. If you live in Oakville, chances are we've already worked on a home like yours.",
        ],
      },
    ],
  },

  Mississauga: {
    heading: "Stairlift Installation in Mississauga for Every Type of Home",

    blocks: [
      {
        type: "paragraphs",
        items: [
          "Stairs get harder with age. That's just true. A knee that used to handle two flights a day starts to hurt after one. Balance gets shakier. A fall on the stairs can turn into a hospital stay, and that's the risk stairlifts in Mississauga are built to remove.",
          "We sell stairlifts, not quick fixes. That means we don't push the same model on everyone who calls. Some staircases are short and straight. Some have a bend halfway up. Some lead outside to a porch or garage. Each one needs a different setup, and we figure that out before we quote you a price.",
          "The process is simple. You reach out by phone or through our contact form and tell us about your staircase. We ask a few questions about its shape and length, then put together quote options that fit your budget. No hidden fees added later.",
          "Once you say yes, we order the lift, build the rail to match your stairs, and install it. We test it with you standing right there. You get to try the seat, the controls, and the seatbelt before we leave.",
          "People choose stairlifts in Mississauga for a lot of reasons. Some are recovering from surgery. Some are caring for an aging parent. Many people just want to stop worrying about a fall. Whatever your reason, we treat the job the same way: carefully, and without pressure to buy more than you need.",
        ],
      },

      {
        type: "section",
        heading: "What Affects the Price",
        paragraphs: [
          "Straight staircases cost less because the rail comes in standard lengths. Curved staircases cost more, since the rail has to be built for your exact stairs. Battery backup, a wider seat, and outdoor weatherproofing can also raise the price. We break down every cost during your free quote, so nothing catches you off guard.",
        ],
      },

      {
        type: "section",
        heading: "Areas We Reach Across Mississauga",
        paragraphs: [
          "Mississauga stretches wide, from busy condo towers near the lake to quieter, older streets further north. We install stairlifts across the whole city, in high-rises, townhomes, and detached houses alike. No matter which part of Mississauga you call home, our team can get to you, assess your stairs, and get a lift installed without a long wait.",
        ],
      },
    ],
  },

  Milton: {
    heading: "Stairlifts in Milton Made for Safer Everyday Living",

    blocks: [
      {
        type: "paragraphs",
        items: [
          "Milton is one of the fastest growing towns in the GTA. New families move in every year, but that also means more homes with parents or grandparents living under one roof. When three generations share a house, stairs stop being just a hallway. They become a daily risk for whoever struggles to use them.",
          "A stairlift fixes that without a renovation. It works on your existing staircase and doesn't touch walls or floors. You can still use the stairs normally. The lift just folds up out of the way when it's not needed.",
        ],
      },

      {
        type: "heading",
        text: "Here are a few signs a stairlift is worth looking into:",
      },

      {
        type: "list",
        items: [
          "Someone in the house holds the railing tightly or pauses on landings to catch their breath.",
          "A parent or grandparent has stopped using the upstairs bedroom or basement because the stairs feel risky.",
          "You're recovering from surgery and stairs are part of your daily routine, not something you can avoid.",
          "A fall has already happened, or almost happened, on the stairs.",
        ],
      },

      {
        type: "paragraphs",
        items: [
          "If any of that sounds familiar, reach out to us for a consultation. Tell us about your staircase, straight, curved, or outdoor, and we'll put together quote options based on what you describe. You can compare a few different setups before committing to anything.",
          "Milton keeps growing, and so does the number of homes that need this kind of setup. We keep pace with that by scheduling assessments quickly, usually within the week.",
        ],
      },

      {
        type: "section",
        heading: "What's Included With Every Stairlift",
        paragraphs: [
          "Every stairlift we install comes with a warranty. We also include a full walkthrough after installation, so you know how the controls, seatbelt, and folding seat work before we leave. If something feels off in the first year, you call us and we come back to fix it.",
        ],
      },

      {
        type: "section",
        heading: "Booking Your Free Consultation",
        paragraphs: [
          "Reach out by phone or through our contact form and tell us about your staircase. We'll ask a few questions about its shape and length, then put together quote options that fit different budgets. You can ask questions, compare choices, and pick what works before we schedule anything.",
        ],
      },
    ],
  },

  Brampton: {
    heading: "Stairlifts in Brampton for a Safer Home",

    blocks: [
      {
        type: "paragraphs",
        items: [
          "A staircase shouldn't be the reason someone stops using half their house. But that's what happens for a lot of families in Brampton. A parent stops going upstairs. A basement bedroom sits empty. Someone starts sleeping on the couch because the stairs feel too risky at night.",
          "A stairlift in Brampton changes that. It attaches to your existing staircase and carries you up and down in a seated position, at a controlled, steady pace.",
        ],
      },

      {
        type: "heading",
        text: "Three types cover most homes:",
      },

      {
        type: "list",
        items: [
          "Straight stairlifts: for staircases with no turns or landings. These install fastest and cost the least, since the rail comes in standard sizes.",
          "Curved stairlifts: for staircases with a bend, a landing, or a spiral shape. The rail is custom-built to trace your exact stairs, so it takes longer to source and fit.",
          "Outdoor stairlifts: built to handle rain, snow, and temperature swings. Good for homes with steps up to a porch, deck, or side entrance.",
        ],
      },

      {
        type: "paragraphs",
        items: [
          "Not sure which one applies to you? Reach out and describe your staircase. We'll ask a few follow-up questions and send back stairlift quote options that match what you actually have, not a generic estimate.",
        ],
      },

      {
        type: "paragraphs",
        items: [
          "Once you choose one of the stairlifts in Brampton, we handle the ordering and the installation ourselves, start to finish. You won't be dealing with a middleman or a separate installation crew",
        ],
      },
      {
        type: "section",
        heading:"Why Choose Us for Stairlifts",
        list: [
          "Straightforward quotes, no pressure to decide fast",
          "Installation done by our own trained team",
          "Options for straight, curved, and outdoor stairs",
        ],
      },
      {
        type: "section",
        heading: "Serving Your Area",
        paragraphs: [
          "We help homeowners across Brampton and nearby communities move through their homes safely, without the cost or hassle of a renovation.",
        ],
      },
    ],
  },

  Toronto: {
    heading: "Stairlifts in Toronto for Older and Newer Homes Alike",

     blocks: [
      {
        type: "paragraphs",
        items: [
          "Many homes in Toronto are older. The staircases in these homes were built long before anyone thought about accessibility. They tend to be steep, narrow, and sometimes have a turn partway up.",
          "That becomes a problem when someone's mobility changes but the house stays the same. Stairs that were never an issue at 40 can turn into a daily struggle later, after a surgery, an injury, or just age catching up.",
          "A stairlift in Toronto fixes this without any structural work. It mounts to the treads of your stairs, not the walls. That means even an older staircase can carry a stairlift just as well as a newer one.",
        ],
      },
      {
        type: "heading",
        text:"Straight, Curved, and Everything Between",
      },
      {
        type: "paragraphs",
        items: [
          "Downtown condos and newer townhouses usually have short, straight staircases. Older detached and semi-detached homes often have a landing or bend partway up, which needs a curved rail. Some homes also have outdoor steps up to a porch or side entrance, which need a weather-rated lift instead of an indoor model.",
          "Reach out and describe your staircase, and we'll send back quote options based on what you tell us. Once you pick one, our professional team will install it.",
        ],
      },

      {
        type: "section",
        heading: "Getting a Quote",
        paragraphs: [
          "Contact us by phone or through our site and tell us about your stairs. We'll ask a few questions, then send quote options that match your staircase and budget. You can compare choices before deciding on anything.",
        ],
      },

      {
        type: "section",
        heading: "Peace of Mind Included",
        paragraphs: [
          "Most stairlifts come with a warranty of three to five years covering the motor, gearbox, and rail. Once yours is installed, we walk you through the seat, controls, and seatbelt so you feel confident using it right away.",
        ],
      },
    ],
  },

   Hamilton: {
    heading: "Quality Stairlifts in Hamilton at Affordable Prices",

    blocks: [
      {
        type: "paragraphs",
        items: [
          "A staircase can turn into a real barrier once climbing it gets hard. Not because the house is unsafe, but because a body changes faster than a home does. That's usually when people start looking into stairlifts in Hamilton, often after a fall, a surgery, or a diagnosis that makes stairs riskier than they used to be.",
          "A stairlift solves the problem directly. It rides along a rail fixed to the treads of your staircase, not the wall, so it doesn't touch the structure of your home. You sit down, use a simple control, and it carries you up or down at a steady pace.",
          "Two main types cover most staircases. Straight stairlifts work where the staircase runs in one line, with no turns. Curved stairlifts are built for staircases with a bend or a landing. If you're not sure which one applies, describe your staircase to us and we'll figure it out together.",
          "We also build outdoor stairlifts for homes with steps leading to a porch, deck, or side entrance. These are made from weather-resistant materials, so they hold up through Hamilton winters without issue.",
          "Getting started is simple. Contact us, tell us about your stairs, and we'll send back a few quote options for stairlifts in Hamilton based on what you describe. Once you choose one, we handle the build and the installation for you.",
        ],
      },

      {
        type: "section",
        heading: "Common Questions Before Buying",
        list: [
          "Does installation damage my stairs? No. The rail attaches to the treads, not the walls.",
          "How long does installation take? Straight lifts usually go in within a day. Curved ones can take a little longer since the rail is custom built.",
          "Will it work during a power outage? Yes. Stairlifts run on a battery that recharges from a regular outlet.",
        ],
      },

      {
        type: "section",
        heading: "What You Get with Your Purchase",
        paragraphs: [
          "Every stairlift in Hamilton we sell comes with a multi-year warranty. Once it's installed, we show you how to use the seat, controls, and seatbelt so you're comfortable right away.",
        ],
      },
    ],
  },
};