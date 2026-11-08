/** Original cultural interpretations, expressed as everyday examples.
 * Helpful habits are reflection prompts, not facts known about a customer's life. */
export interface ReadingGuidance {
  keepClose: string[]
  watchFor: string[]
}
export interface PersonalProfile extends ReadingGuidance {
  headline: string
  image: string
  focus: string
  strength: string
  pressure: string
  need: string
  example: string
  balance: string
  practice: string
}
export const PERSONAL_PROFILES: Record<string, PersonalProfile> = {
  '甲': {
    headline: 'A clear goal, with room to change the plan',
    image: 'a tree growing toward the light', focus: 'direction and steady growth',
    strength: 'You may find it easier to act when you have a **clear goal**. You can help others see what to do next.',
    pressure: 'You may keep following a plan after it stops working. Changing the plan can feel like giving up.',
    need: "a clear goal and freedom to choose a way forward",
    example: 'You lead a project, but the deadline changes. Working harder is one option. **Changing the plan** may get you there with less pressure.',
    balance: '**Keep the goal. Adjust the plan.** A different method can still take you where you want to go.',
    practice: 'Choose one goal. Write down one part of the plan you could change.',
    keepClose: ['People who support your goal and suggest other routes.', 'A plan with room for delays and new ideas.'],
    watchFor: ['Defending a plan simply because you chose it first.', 'Treating a different suggestion as a lack of support.'],
  },
  '乙': {
    headline: 'You can adapt without giving up your own needs',
    image: 'a vine finding a way around a wall', focus: 'flexibility and finding another way',
    strength: 'You may be good at **adjusting when plans change**. You often notice a way forward that others have missed.',
    pressure: 'Small compromises can add up. You may keep everyone happy while leaving too little time for yourself.',
    need: "kindness and a chance to say what works",
    example: 'A group changes its plans again. You make the new arrangement work, but your own task falls behind. **Your time matters too.**',
    balance: 'Say what you can change and what you need to keep. **A clear limit** makes it easier to help without feeling pushed aside.',
    practice: 'Before your next yes, name one thing you need to keep.',
    keepClose: ['People who ask what works for you.', 'Flexible plans with clear limits on your time.'],
    watchFor: ['Saying yes before checking your own plans.', 'Hiding a need to keep the peace.'],
  },
  '丙': {
    headline: 'Bring your energy, and leave time to rest',
    image: 'sunlight making a room brighter', focus: 'warmth and sharing ideas',
    strength: 'Your **enthusiasm** may help people try something new. You can make an idea feel easier to begin.',
    pressure: 'People may keep asking for help because you seem ready. Being available all the time can leave you tired.',
    need: "warm contact and time without demands",
    example: 'You get a group excited, answer messages and take on the next task. Soon, everyone relies on your energy. **Leave space to recharge.**',
    balance: 'Tell people when you can help. **Rest belongs in the plan**, before you run out of energy.',
    practice: 'Set aside one quiet hour. Let people know when you will reply.',
    keepClose: ['People who share the effort and respect your breaks.', 'Quiet time between busy or social tasks.'],
    watchFor: ['Answering every message straight away.', 'Agreeing to another task when you already need rest.'],
  },
  '丁': {
    headline: 'Care about the details, then let the work be finished',
    image: 'a lamp lighting the detail in front of you', focus: 'care and close attention',
    strength: 'You may show care through **small, thoughtful details**. You notice what would make something more useful or personal.',
    pressure: 'A small choice can take too long when you want it to feel just right. You may keep thinking after the answer is clear.',
    need: "time to think and a clear point at which to stop",
    example: 'You rewrite a message to someone you care about. They may already value your kindness. **One more rewrite** may add very little.',
    balance: 'Decide what the result needs to do before you start. **Good enough can still be thoughtful.**',
    practice: 'Set a finishing time for one small task. Stop when it does the job.',
    keepClose: ['People who value your care without asking for perfection.', 'A quiet place and a clear finishing time.'],
    watchFor: ['Giving every small choice too much weight.', 'Using another revision to delay sending the work.'],
  },
  '戊': {
    headline: 'Be dependable, without carrying everything alone',
    image: 'solid ground that others can stand on', focus: 'stability and keeping promises',
    strength: 'You may help others feel secure by **keeping your promises**. You can stay practical when a situation gets difficult.',
    pressure: 'Being dependable can turn into doing everything. You may wait for someone to notice that you need help.',
    need: "clear responsibilities and people who share the work",
    example: "A job goes wrong, so you fill the gaps. That solves today's problem. **Who will do those tasks next time?**",
    balance: 'Agree who will do each part. **Asking for help** can be part of doing a job well.',
    practice: 'Choose one task you usually carry alone. Ask someone to share it.',
    keepClose: ['People who follow through on their part.', 'A clear division of work and regular breaks.'],
    watchFor: ['Taking over before asking others to help.', 'Calling yourself reliable while ignoring your own limits.'],
  },
  '己': {
    headline: "Make room for your plans as well as other people's",
    image: 'a garden that grows with regular care', focus: 'patience and everyday care',
    strength: 'You may notice **small practical needs** that others miss. Regular care helps you turn an idea into something useful.',
    pressure: 'There is always another person to help or task to tidy up. Your own plans may keep moving to the end of the list.',
    need: "a steady routine with time for personal plans",
    example: "You spend the morning sorting out everyone else's needs. Your own task is still waiting. **Book time for it first.**",
    balance: 'Choose one step that matters to you. **Put it on the calendar**, instead of waiting for a free moment.',
    practice: 'Book twenty minutes for your own next step before adding another task.',
    keepClose: ['People who notice and share the everyday work.', 'A routine that includes your own plans.'],
    watchFor: ['Helping everyone else before starting your own task.', 'Waiting until every small job is finished.'],
  },
  '庚': {
    headline: 'Say it clearly, and leave room to listen',
    image: 'a tool that cuts through a difficult job', focus: 'clear decisions and taking action',
    strength: 'You may prefer **direct answers and clear progress**. You can help a group stop circling a problem and take the next step.',
    pressure: 'A clear standard can sound like harsh criticism. Others may need to hear why the detail matters to you.',
    need: "honest answers and room to try another method",
    example: 'A teammate misses a detail you consider important. **Explain the reason** before asking them to change it.',
    balance: 'Be clear about the result you need. **Listen to their method** before deciding it is wrong.',
    practice: "Explain one standard in plain words. Then ask for the other person's view.",
    keepClose: ['People who speak honestly and listen in return.', 'Clear goals with room for different methods.'],
    watchFor: ['Correcting someone before hearing their explanation.', 'Treating a different method as a lower standard.'],
  },
  '辛': {
    headline: 'Notice the details, without waiting for perfection',
    image: 'a carefully polished piece of jewellery', focus: 'quality and attention to detail',
    strength: 'You may have a **sharp eye for small details**. You notice words, colours or finishing touches that improve the result.',
    pressure: 'You may keep fixing small details, even when the work is already good enough. That can make it harder to finish.',
    need: "kind, clear communication and respect for personal preferences",
    example: 'Your work is ready, but you keep changing one small part. **Share the useful version.** Feedback may help more than another private revision.',
    balance: 'Choose the few details that truly matter. **Let the rest be good enough** for this version.',
    practice: 'Set a finishing time. Share the work when it meets your main goal.',
    keepClose: ['People who give clear, kind feedback.', 'A short checklist that tells you when the work is finished.'],
    watchFor: ['Changing small details after the work is ready.', 'Waiting for a perfect result before showing anyone.'],
  },
  '壬': {
    headline: 'Explore your options, then choose one next step',
    image: 'a river finding more than one way forward', focus: 'seeing connections and exploring options',
    strength: 'You may be good at **connecting ideas**. When one route is blocked, you can often see another.',
    pressure: 'Every new option can look worth trying. You may keep exploring without choosing what to do today.',
    need: "room to explore and a clear next step",
    example: 'You find three ways to improve a project and research all of them. The task still needs one result. **Pick a small test.**',
    balance: 'Keep a note of the other ideas. **Try one option first**, then use the result to choose what comes next.',
    practice: 'Choose one idea to test this week. Give it a clear finishing date.',
    keepClose: ['People who welcome ideas and help you choose a first step.', 'A place to save ideas without starting all of them.'],
    watchFor: ['Opening a new task before testing the current idea.', 'Mistaking more research for a finished decision.'],
  },
  '癸': {
    headline: 'Take time to think, and let people hear your needs',
    image: 'rain reaching places that are easy to overlook', focus: 'listening and noticing quiet details',
    strength: 'You may learn a lot by **listening and watching**. You notice small signs and ask questions others have missed.',
    pressure: 'People may assume you agree when you stay quiet. They cannot know which part you are still thinking about.',
    need: "time to think and a chance to speak without being rushed",
    example: 'Something in a conversation does not feel right. You keep thinking while others move on. **Share what you know so far.**',
    balance: 'You can say that you are still thinking. **A first answer is enough** to let others know where you stand.',
    practice: 'Say one need aloud, even if you are still working out the details.',
    keepClose: ['People who listen without rushing your answer.', 'Time to think, followed by a clear chance to speak.'],
    watchFor: ['Keeping a need private and hoping others notice.', 'Letting silence stand in for an answer.'],
  },
}
export interface WorkProfile extends ReadingGuidance {
  title: string
  theme: string
  setting: string
  contribution: string
  friction: string
  scene: string
  next: string
}
export const WORK_PROFILES: Record<string, WorkProfile> = {
  '比肩': {
    title: 'Own your part of the work', theme: "having a say and respecting other people’s choices",
    setting: "a job you understand and room to decide how to do it",
    contribution: "getting on with a job without needing every step approved",
    friction: 'being responsible for a result while someone controls every small step',
    scene: 'You are asked to deliver a result, but each step needs approval. Agree what must be checked and what you can decide yourself.',
    next: 'Choose one task. Agree what you can decide and how the result will be checked.',
    keepClose: ['Colleagues who trust you with a clearly agreed task.', 'A clear goal and room to choose your method.'],
    watchFor: ['Taking responsibility without enough freedom to act.', 'Doing everything alone when a useful teammate is available.'],
  },
  '劫財': {
    title: 'Learn with others, at your own pace', theme: 'teamwork and friendly competition',
    setting: "people to work with and a chance to hear what is helping",
    contribution: 'learning with others and helping a group move forward',
    friction: "turning someone else's speed into a race you did not choose",
    scene: 'A colleague finishes quickly and you want to match them. Check whether your task needs the same speed or more careful attention.',
    next: "Choose one way to measure your own progress before comparing it with someone else's.",
    keepClose: ['Teammates who share ideas and celebrate progress.', 'A fair way to measure the work you actually do.'],
    watchFor: ['Taking on extra pressure simply to keep up.', 'Comparing different tasks as if they were the same race.'],
  },
  '食神': {
    title: 'Build a skill you can use', theme: "getting better at something you enjoy doing",
    setting: "time to practise and make a familiar job easier",
    contribution: 'turning a skill into something people can use',
    friction: 'keeping a comfortable routine after it stops working well',
    scene: 'You know a task well, but the same problem keeps returning. Change that step and compare the next result.',
    next: 'Improve one step in a familiar task. Check whether the next result works better.',
    keepClose: ['People who value steady practice and useful results.', 'A routine with time to check and improve one step.'],
    watchFor: ['Repeating a process simply because it is familiar.', 'Avoiding feedback that could make your work easier.'],
  },
  '傷官': {
    title: 'Show how your idea could work', theme: 'new ideas and speaking up',
    setting: 'room to ask questions and try a different method',
    contribution: 'noticing a better way and showing it in practice',
    friction: 'sounding critical when you want to improve the result',
    scene: 'You disagree with the usual method. Bring a small working example so others can see what your idea changes.',
    next: 'Show one small example of your idea. Explain which problem it solves.',
    keepClose: ['People who ask questions and test ideas fairly.', 'A place to try a small change before a big one.'],
    watchFor: ['Pointing out faults without offering a useful next step.', 'Expecting everyone to understand an idea before seeing it.'],
  },
  '偏財': {
    title: 'Explore opportunities, then choose one', theme: "trying new things and getting to know people",
    setting: 'variety, contact with people and clear plans for new ideas',
    contribution: 'connecting people and ideas to make something useful happen',
    friction: 'starting several promising tasks before finishing the first',
    scene: 'A new idea arrives while you are already busy. Work out who will do the job and how much time it needs.',
    next: 'Choose one opportunity. Check the time it needs and finish the first agreed step.',
    keepClose: ['People who turn a promising idea into a clear plan.', 'A short list of opportunities you can actually finish.'],
    watchFor: ['Saying yes because an offer sounds exciting.', 'Starting more projects than your time allows.'],
  },
  '正財': {
    title: 'Make everyday promises manageable', theme: "keeping everyday work and costs in order",
    setting: 'clear duties and a realistic amount of work',
    contribution: 'keeping the promises and details that make a plan work',
    friction: 'adding small duties until there is no room to rest',
    scene: 'A task seems easy to add today. Check whether you will have to keep doing it every week.',
    next: 'Review one regular task. Agree who will do each part and how much time it needs.',
    keepClose: ['People who keep clear, realistic agreements.', 'A routine that includes work, checks and rest.'],
    watchFor: ['Adding regular duties without checking the total workload.', 'Keeping an old promise after the circumstances have changed.'],
  },
  '偏官': {
    title: 'Handle pressure one decision at a time', theme: 'taking action under pressure',
    setting: "a problem worth solving and permission to make the decisions it needs",
    contribution: 'acting when a problem needs a quick, clear response',
    friction: 'treating every request as urgent',
    scene: 'Several people need an answer. Find the deadline that is real, then decide which request can wait.',
    next: 'Find the most urgent task. Give the others a clear time for your answer.',
    keepClose: ['People who stay clear and practical under pressure.', 'A short list showing what truly needs attention first.'],
    watchFor: ["Taking another person's panic as your deadline.", 'Making a quick promise before checking the task.'],
  },
  '正官': {
    title: 'Know what is expected, then act', theme: "knowing what is expected and being trusted",
    setting: "a clear idea of what the job needs and help when you need it",
    contribution: "doing what you said you would do",
    friction: 'waiting for permission after you already have a clear agreement',
    scene: 'Your work meets the agreed standard, but you hesitate to send it. Check whether more approval is actually needed.',
    next: 'Confirm what the finished task must do. Use that agreement to decide when to stop.',
    keepClose: ['People who explain expectations and provide support.', 'A written standard that tells you when the job is done.'],
    watchFor: ['Seeking extra approval for a task already agreed.', 'Following a rule without understanding what it is for.'],
  },
  '偏印': {
    title: 'Turn what you learn into a small test', theme: "working things out in your own way",
    setting: 'time to study and a chance to test your own ideas',
    contribution: 'finding a different explanation and trying it out',
    friction: 'staying in research because testing an idea feels harder',
    scene: 'Another article looks interesting, but your question has not changed. Try the best answer you already have.',
    next: 'Turn one idea you have studied into a small example someone can try.',
    keepClose: ['People who welcome questions and encourage a real test.', 'Study time with a clear point at which to try something.'],
    watchFor: ['Opening another source instead of using what you know.', 'Waiting until an idea has no unanswered questions.'],
  },
  '正印': {
    title: 'Use support and share what you know', theme: "learning from someone and passing it on",
    setting: "someone who can explain things and a chance to help others learn",
    contribution: 'helping others understand what to do next',
    friction: 'preparing every detail before trying anything',
    scene: 'You want a full explanation before you begin. Find out what you need to know for the first small attempt.',
    next: 'Use something you already understand to help someone finish one small task.',
    keepClose: ['People who explain clearly and help you practise.', 'A small task where you can use what you already know.'],
    watchFor: ['Preparing so long that you never begin.', 'Relying on support without practising the task yourself.'],
  },
}
WORK_PROFILES['七殺'] = WORK_PROFILES['偏官']
export interface RelationshipProfile extends ReadingGuidance {
  headline: string
  need: string
  friction: string
  words: string
}
export const RELATIONSHIP_PROFILES: Record<string, RelationshipProfile> = {
  '子': { headline: 'Make space to think, then return to the conversation', need: 'time to think before a difficult conversation', friction: 'going quiet without saying when you will talk again', words: 'I want to talk about this. Can we take a break and come back to it tonight?', keepClose: ['People who respect a pause and return to the conversation.', 'A clear time to talk again.'], watchFor: ['Going quiet and hoping your care will be understood.', 'Leaving a difficult conversation open with no next step.'] },
  '丑': { headline: 'Small promises can help you feel secure', need: 'small promises that are kept', friction: 'expecting a familiar routine to explain an unspoken need', words: 'It helps me when we agree on a plan. What works for you too?', keepClose: ['People whose everyday actions match their words.', 'Simple plans both people understand.'], watchFor: ['Expecting someone to guess what a routine means to you.', 'Treating every change of plan as a lack of care.'] },
  '寅': { headline: 'Choose the next step together', need: 'a chance for both people to make choices', friction: 'moving ahead before the other person has agreed', words: 'I am ready for a change. What would help us choose the next step together?', keepClose: ['People who welcome ideas and share decisions.', 'Time to check that both people want the same pace.'], watchFor: ['Deciding for both people because you feel ready.', 'Reading a slower answer as a lack of interest.'] },
  '卯': { headline: 'Be kind, and make your request clear', need: 'kind words and an honest answer', friction: 'hinting when you need to make a clear request', words: 'I care about how you feel. I also need to say what works for me.', keepClose: ['People who can be kind and direct at the same time.', 'Clear requests that leave room for an honest answer.'], watchFor: ['Using hints and hoping they will be understood.', 'Saying yes simply to avoid an uncomfortable moment.'] },
  '辰': { headline: 'Agree who will handle each part', need: 'clear decisions and shared responsibilities', friction: 'assuming the other person has already taken charge', words: 'Which part will you handle? Which part would you like me to take?', keepClose: ['People who share practical responsibilities.', 'A clear plan for who will do each task.'], watchFor: ['Assuming a job has been agreed without discussing it.', 'Taking over and then feeling left with everything.'] },
  '巳': { headline: 'Share enough for someone to understand you', need: 'privacy, trust and enough information to understand each other', friction: 'keeping a feeling private while expecting someone to understand it', words: 'I am still working out how I feel. This is what I need right now.', keepClose: ['People who respect privacy and ask rather than assume.', 'A small, honest update when you are still thinking.'], watchFor: ['Testing whether someone can guess what you feel.', 'Keeping all the details back during an important conversation.'] },
  '午': { headline: 'Enjoy closeness and keep time for your own life', need: 'warm attention and time for your own interests', friction: 'taking a request for space as a lack of love', words: 'I enjoy our time together. I also need time for this part of my own life.', keepClose: ['People who make time for you and respect your interests.', 'Plans for shared time and time apart.'], watchFor: ['Treating every separate activity as distance.', 'Giving up your own interests to prove that you care.'] },
  '未': { headline: 'Listen first, then offer help', need: 'being heard before someone offers a solution', friction: 'solving a problem before asking what help is wanted', words: 'Would you like help with a solution, or would you rather I listen?', keepClose: ['People who ask what kind of help you want.', 'Time to listen before deciding what to do.'], watchFor: ['Giving advice before hearing the whole problem.', 'Taking over a decision that belongs to someone else.'] },
  '申': { headline: 'Hear the feeling behind the problem', need: 'listening as well as practical help', friction: 'offering an answer before hearing how the problem feels', words: 'I have an idea. First, I want to understand what has been hardest for you.', keepClose: ['People who listen before jumping to an answer.', 'A chance to explain both the problem and the feeling.'], watchFor: ['Treating every feeling as a problem to fix.', 'Rushing a conversation toward the quickest solution.'] },
  '酉': { headline: 'Respect what matters to each of you', need: "respect for each person's preferences", friction: 'treating a different preference as a lack of effort', words: 'This detail matters to me. What matters most to you?', keepClose: ['People who ask why a detail matters to you.', 'An agreement about the few things each person values most.'], watchFor: ["Assuming your standard should be everyone's standard.", 'Reading a different preference as a personal criticism.'] },
  '戌': { headline: 'Let everyday actions build trust', need: 'trust built through steady everyday actions', friction: 'judging care by an expectation you have not explained', words: 'This is what makes a promise feel real to me. What does that look like for you?', keepClose: ['People who follow through and discuss changes honestly.', 'Promises that are small enough to keep.'], watchFor: ['Testing someone against a rule they do not know.', 'Giving more weight to a big promise than everyday actions.'] },
  '亥': { headline: 'Say what you feel, without rushing an answer', need: 'time to share a feeling without being rushed', friction: 'hoping someone notices a need you have not said aloud', words: 'I have been keeping this to myself. I do not need an answer yet, but I want you to know.', keepClose: ['People who make time to hear what you feel.', 'A calm moment to say one need clearly.'], watchFor: ['Holding something in until it becomes resentment.', 'Expecting another person to notice a need you have hidden.'] },
}
