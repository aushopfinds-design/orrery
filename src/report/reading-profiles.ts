/** Original editorial interpretations. Chart markers are calculated; these
 * everyday examples are cultural reading prompts, not observed personal facts. */
export interface PersonalProfile {
  headline: string
  image: string
  strength: string
  pressure: string
  need: string
  example: string
  balance: string
}

export const PERSONAL_PROFILES: Record<string, PersonalProfile> = {
  '甲': {
    headline: 'A clear direction, with room to change the route', image: 'a tree growing toward the light',
    strength: 'You may feel most useful when you can see a direction and help something move toward it. Starting from a clear principle can make your decisions easier, especially when other people are unsure what comes next.',
    pressure: 'The difficult moment can come when a plan stops fitting the situation. You may keep defending the original route because changing it feels like abandoning the goal. Other people might be asking for a different method, rather than a smaller ambition.',
    need: 'a shared direction and freedom to choose the route',
    example: 'You agree to lead a project, then find that the original deadline no longer fits. Your first instinct might be to work harder. A more useful question is which part of the plan can change without losing the purpose.',
    balance: 'Keep the goal clear and make the method negotiable. A person who suggests a different route may be helping your idea survive, even when their suggestion initially sounds like resistance.',
  },
  '乙': {
    headline: 'A flexible approach, with a place for your own needs', image: 'a vine finding its way around a wall',
    strength: 'You may be quick to notice what has changed and adjust without making a scene. That can help you work with different personalities and find another way forward when a direct approach would create unnecessary friction.',
    pressure: 'The difficult moment can come after several small compromises. Each one may seem reasonable, but together they can leave very little room for your own preference. Flexibility works better when people can still tell what matters to you.',
    need: 'kindness, choice and clear personal boundaries',
    example: 'A group keeps changing its plans and you make every new arrangement work. At first that feels useful. Later, you notice that your own task is the only one that has not moved forward.',
    balance: 'Say what you can change and what you need to keep. A clear limit does not remove your ability to adapt; it gives that ability somewhere useful to start.',
  },
  '丙': {
    headline: 'An open presence, with time to recharge', image: 'sunlight making a whole room brighter',
    strength: 'You may bring momentum by making an idea feel possible and including other people in it. Being open about what interests you can help a group move from hesitation to a first attempt.',
    pressure: 'The difficult moment can come when being available becomes the default. People may keep bringing you questions because you seem ready to help. Your enthusiasm needs some quiet space if it is going to last beyond the first burst.',
    need: 'warm contact without being constantly available',
    example: 'You get people excited about a new idea, answer their messages and volunteer for the next task. Before long, the project depends on your energy even during the hours when you hoped to rest.',
    balance: 'Keep your welcome and make your availability specific. Telling people when you can help often works better than waiting until you are tired enough to disappear.',
  },
  '丁': {
    headline: 'Careful attention, with a clear stopping point', image: 'a lamp lighting the detail in front of you',
    strength: 'You may make your strongest contribution through attention to detail, purpose and the person in front of you. A small change that makes something feel right can matter more to you than a dramatic display.',
    pressure: 'The difficult moment can come when every small choice starts carrying too much meaning. Wanting to get it right can turn a useful adjustment into another hour of thought. A clear stopping point helps care become finished work.',
    need: 'thoughtful attention and enough space to think',
    example: 'You are preparing something for someone you care about. You keep improving the wording or the final detail because you want the effort to feel personal. The person may already value the care more than the last revision.',
    balance: 'Decide what the finished result needs to do before refining it. You can care deeply without making every detail prove how much you care.',
  },
  '戊': {
    headline: 'A steady presence, with support of your own', image: 'solid ground that others can stand on',
    strength: 'You may bring steadiness by taking promises seriously and keeping track of what needs to happen. Other people can find it reassuring when you stay practical instead of making a situation more dramatic.',
    pressure: 'The difficult moment can come when being dependable quietly turns into carrying everything. You may wait for others to notice the weight because asking for help feels harder than doing one more task yourself.',
    need: 'reliability, clear responsibilities and shared effort',
    example: 'A job is going badly, so you take over the missing parts to keep it moving. The immediate problem is solved. The longer problem is that nobody has agreed who will carry those parts next time.',
    balance: 'Make the division of work visible before it becomes a test of endurance. Dependability can include asking someone else to carry their share.',
  },
  '己': {
    headline: 'Patient care, with room for your own plans', image: 'a garden that improves through regular care',
    strength: 'You may notice the small practical needs that keep a person, home or project working well. Consistent attention can be your way of turning a good idea into something people can use every day.',
    pressure: 'The difficult moment can come when the next useful task always belongs to someone else. Looking after what is already there may push your own unfinished plan further down the list, even when you still care about it.',
    need: 'everyday care that goes in both directions',
    example: 'You remember what everybody needs and make their day easier. At the end of the week, your own appointment or project is still waiting because another small request always came first.',
    balance: 'Give your own next step the same practical care you give other people. Put it in the schedule, make it specific and let someone know why that time matters.',
  },
  '庚': {
    headline: 'Clear standards, with room for a different approach', image: 'a tool that cuts through a difficult job',
    strength: 'You may prefer a direct answer, a clear standard and work that moves a problem forward. When a situation feels vague, naming what needs to happen can be one of your most useful contributions.',
    pressure: 'The difficult moment can come when efficiency leaves little space for another person to explain their position. A standard can be sound while the way it is delivered makes cooperation harder.',
    need: 'honesty, respect and a clear understanding of the task',
    example: 'You see a faster way to finish a job and say so immediately. Another person hears criticism of their effort. The useful idea can get lost unless you first explain the problem you are trying to solve.',
    balance: 'Keep the standard and give people a reason they can work with. Directness becomes easier to trust when the other person can see that the aim is to solve the problem together.',
  },
  '辛': {
    headline: 'A sharp eye for quality, with permission to finish', image: 'a carefully polished piece of jewellery',
    strength: 'You may notice the wording, finish or small difference that changes how something feels. That eye for quality can help you recognise when a result is technically complete but still does not quite meet its purpose.',
    pressure: 'The difficult moment can come when the last improvement keeps moving. Comparing a real piece of work with an ideal version may make it harder to share what is already useful.',
    need: 'careful communication and respect for personal standards',
    example: 'You have a good piece of work ready, but keep changing the last detail before showing it. Feedback on the usable version might help more than another private round of polishing.',
    balance: 'Name the few details that truly matter and let the rest be good enough for this version. A clear standard for finishing can be as useful as your standard for quality.',
  },
  '壬': {
    headline: 'A broad view, with one next step to follow', image: 'a river finding more than one way forward',
    strength: 'You may enjoy seeing how ideas connect and finding another route when a problem looks blocked. Keeping a wider view can help you notice options that a more fixed approach might miss.',
    pressure: 'The difficult moment can come when every new possibility feels worth pursuing. Having several good routes does not tell you which one to take today, and a promising decision can stay unfinished.',
    need: 'freedom to explore and a clear agreement about what comes next',
    example: 'You find three ways to improve a project and start researching all of them. Each route brings another useful idea. The original task still needs one result that can be tested.',
    balance: 'Keep a place for the other possibilities and choose one route for the next attempt. A deadline for a small experiment can turn a broad view into something you can learn from.',
  },
  '癸': {
    headline: 'Thoughtful observation, with words others can hear', image: 'rain reaching places that are easy to overlook',
    strength: 'You may learn by listening, noticing small signals and letting an idea develop before speaking. That can help you ask a useful question instead of rushing to the first answer.',
    pressure: 'The difficult moment can come when an unspoken thought becomes an unspoken need. Other people may assume you agree because they cannot see how much you are still considering.',
    need: 'time to reflect and an invitation to speak plainly',
    example: 'You notice something in a conversation that does not feel right and spend time trying to understand it. By the time you are ready to explain, everyone else thinks the decision has already been made.',
    balance: 'Share the early version of your thought. You can say that you are still considering it while making clear that your silence was not an agreement.',
  },
}

export interface WorkProfile {
  setting: string
  contribution: string
  friction: string
  scene: string
  next: string
}

export const WORK_PROFILES: Record<string, WorkProfile> = {
  '比肩': { setting: 'clear ownership, room to choose your method and colleagues who treat you as an equal', contribution: 'taking responsibility for a defined piece of work without needing every step approved', friction: 'having responsibility for the result while someone else controls every small decision', scene: 'Agree what a finished task should achieve, then compare your preferred method with the freedom you actually have.', next: 'Ask for ownership of one specific task and agree how the result will be checked.' },
  '劫財': { setting: 'lively teamwork, quick feedback and a visible way to compare progress', contribution: 'responding to what other people are doing and helping a group find momentum', friction: 'letting somebody else\'s speed turn every task into a competition', scene: 'A colleague finishes quickly and you want to match them. Check whether your task needs the same pace or a different standard.', next: 'Choose a measure of progress that fits your own task before comparing it with somebody else\'s.' },
  '食神': { setting: 'regular practice, useful output and enough time to develop a reliable process', contribution: 'making something repeatable so that the next attempt works better than the last', friction: 'having a comfortable routine that no longer fits what the work needs', scene: 'You know a process well, but one part keeps producing the same problem. Change that part instead of starting everything again.', next: 'Improve one step in a familiar task and compare the next result with the previous one.' },
  '傷官': { setting: 'room to ask questions, suggest alternatives and show an original idea in practice', contribution: 'spotting what an accepted routine could do better and putting another option on the table', friction: 'being heard as critical when your real intention is to improve the result', scene: 'You disagree with the usual method. Bring a small working alternative so that the discussion has something useful to test.', next: 'Show one example of the alternative you are proposing, alongside the problem it solves.' },
  '偏財': { setting: 'variety, contact with different people and opportunities that need practical judgment', contribution: 'connecting people or resources that can help an opportunity move forward', friction: 'starting several promising tasks before the first one has a clear result', scene: 'A new possibility arrives while you are already busy. Write down who will do the work before agreeing that it is a good idea.', next: 'Choose one opportunity, define its cost in time and finish the next agreed step.' },
  '正財': { setting: 'clear responsibilities, dependable delivery and an honest view of the resources available', contribution: 'keeping the everyday promises and practical details that allow a bigger plan to work', friction: 'taking on more measurable duties without making room for rest or a change in direction', scene: 'A task seems small enough to add to your list. Check the recurring work it creates after the first week.', next: 'Review one regular commitment and agree which parts belong to you and which do not.' },
  '偏官': { setting: 'a real challenge, a clear decision and authority to respond when the situation changes', contribution: 'acting when a problem needs attention and somebody has to make the next call', friction: 'treating every request as urgent even when the deadline is only assumed', scene: 'Several people need an answer at once. Separate the decision that has a real deadline from the one that can wait.', next: 'Ask which outcome needs protection, then set the order in which the tasks will be handled.' },
  '正官': { setting: 'clear expectations, trusted procedures and responsibility that is matched by support', contribution: 'making a result dependable enough for other people to rely on', friction: 'waiting for approval that is no longer needed or accepting a rule without understanding its purpose', scene: 'You have done what was asked but still hesitate to deliver it. Compare the agreed standard with the extra permission you are seeking.', next: 'Confirm the expected result and use that agreement as your stopping point.' },
  '偏印': { setting: 'independent study, unusual problems and time to test a connection that others have missed', contribution: 'seeing a different explanation and turning it into a useful approach', friction: 'staying in research because the next practical test might expose a gap', scene: 'Another source looks interesting, but your question has not changed. Test the best answer you already have before opening another route.', next: 'Turn one idea you have been studying into a small demonstration someone else can use.' },
  '正印': { setting: 'good preparation, a supportive learning environment and a chance to pass knowledge on', contribution: 'helping people understand enough to do the task with confidence', friction: 'preparing every detail before letting yourself take the first step', scene: 'You want a complete explanation before trying something new. Decide what you need to know for the first safe attempt.', next: 'Use what you already understand to help someone complete one practical step.' },
}
WORK_PROFILES['七殺'] = WORK_PROFILES['偏官']

export const RELATIONSHIP_PROFILES: Record<string, { need: string; friction: string; words: string }> = {
  '子': { need: 'space to think before a difficult conversation', friction: 'silence being mistaken for a lack of care', words: 'I want to talk about this properly. Can we take a short break and come back to it tonight?' },
  '丑': { need: 'reassurance through small promises that are kept', friction: 'expecting a familiar routine to explain a need you have not said aloud', words: 'It helps me when we agree on a plan. What part of this routine works for you too?' },
  '寅': { need: 'a sense that both people can take initiative', friction: 'moving so quickly that the other person has not chosen the same pace', words: 'I am ready to make a change. What would help us decide on the next step together?' },
  '卯': { need: 'kindness that still leaves room for a clear answer', friction: 'making a gentle hint when the situation needs a direct request', words: 'I care about how this feels for you, and I need to be clear about what works for me.' },
  '辰': { need: 'an open agreement about decisions and shared responsibilities', friction: 'each person thinking the other has already taken charge', words: 'Which part will you handle, and which part would you like me to take?' },
  '巳': { need: 'trust about what is private and what needs to be shared', friction: 'trying to understand a feeling without giving the other person enough information', words: 'I am still working out how I feel, but I can tell you what I need right now.' },
  '午': { need: 'warm attention alongside room for an independent life', friction: 'reading a request for space as a request for distance', words: 'I enjoy our time together, and I also need time for this part of my own life.' },
  '未': { need: 'care that helps both people keep their own voice', friction: 'solving a problem before asking what kind of help was wanted', words: 'Would you like me to help solve this, or would listening be more useful today?' },
  '申': { need: 'a practical response that begins with listening', friction: 'offering a solution before the feeling behind the problem has been heard', words: 'I have an idea, but first I want to understand what has been hardest for you.' },
  '酉': { need: 'respect for different personal standards', friction: 'treating a different preference as a sign that somebody is not trying', words: 'This detail matters to me. Which details matter most to you?' },
  '戌': { need: 'trust shown through consistent everyday actions', friction: 'measuring care against an expectation that the other person does not know about', words: 'This is what makes a promise feel dependable to me. What does that look like for you?' },
  '亥': { need: 'feelings that can be spoken without being rushed', friction: 'hoping another person will notice a need you have kept private', words: 'I have been holding this in. I do not need an answer straight away, but I want you to know.' },
}
