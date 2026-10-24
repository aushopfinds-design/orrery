/** Everyday examples selected by calculated chart themes, not observed life facts. */
interface LifeFocus {
  incomeStyle: string
  payQuestion: string
  moneyExample: string
  moneyWatch: string
  yearQuestion: string
  yearStep: string
  connection: string
}
export const LIFE_FOCUS: Record<string, LifeFocus> = {
  '比肩': {
    incomeStyle: 'making your own contribution clear and keeping room to choose your method',
    payQuestion: 'Which part of the result is mine to deliver, and how will that contribution be recognised?',
    moneyExample: 'Two roles offer similar pay. One gives you a clear area to own; the other makes you responsible for work you cannot control. Ask how decisions and responsibility are shared before comparing the headline amount.',
    moneyWatch: 'taking responsibility for a result without the time or authority to deliver it',
    yearQuestion: 'Where do I want more say, and where would I welcome support?',
    yearStep: 'Choose one personal decision to own. Name the help you would welcome without handing over the whole choice.',
    connection: 'Make one plan together and leave one choice to each person. Shared time can include room for separate preferences.',
  },
  '劫財': {
    incomeStyle: 'sharing work fairly without using someone else’s pace as your only measure',
    payQuestion: 'How will shared work, extra duties and credit be divided?',
    moneyExample: 'A group plans an expensive outing or a colleague takes on extra work. Before matching them, check what you want to join and what you can realistically offer. Belonging does not require an identical contribution.',
    moneyWatch: 'matching another person’s spending or workload before checking your own limits',
    yearQuestion: 'Which connections encourage me, and which comparisons pull me away from my own plan?',
    yearStep: 'Choose one shared activity you enjoy. Agree your contribution before comparing it with anyone else’s.',
    connection: 'Choose something you both enjoy without turning enthusiasm, effort or attention into a competition.',
  },
  '食神': {
    incomeStyle: 'turning a repeatable skill into work you can deliver without hiding the preparation',
    payQuestion: 'Does the agreed time include preparation, finishing and the work needed to repeat the task?',
    moneyExample: 'A finished item takes an hour to make but also needs preparation, clearing up and follow-up. Record the whole process once. The main task alone does not show what a paid commitment asks of you.',
    moneyWatch: 'counting only the enjoyable part of a task and overlooking the work around it',
    yearQuestion: 'What would I enjoy practising or making a regular part of my life?',
    yearStep: 'Choose one skill or enjoyable routine. Give it a small, repeatable place in the week.',
    connection: 'Try a simple shared activity, such as making a meal or taking a familiar walk. Ask what makes it enjoyable for each of you.',
  },
  '傷官': {
    incomeStyle: 'showing how an improvement helps while keeping extra changes inside a clear agreement',
    payQuestion: 'Which improvements belong to this role, and which would need more time or a new agreement?',
    moneyExample: 'You suggest a useful improvement and then keep refining it after the agreed work is finished. Show the first useful result. Discuss the next change before treating it as another invisible duty.',
    moneyWatch: 'adding revisions or improvements after the original task has already been completed',
    yearQuestion: 'What would I like to express or try differently, and how can I make the first version small?',
    yearStep: 'Try a small version of an idea you have been keeping to yourself. Ask one person what they understood.',
    connection: 'Share an idea without correcting the other person’s first response. Make room for their version of the plan too.',
  },
  '偏財': {
    incomeStyle: 'exploring a new opening while checking the work needed after the exciting first step',
    payQuestion: 'What is confirmed, what is still uncertain and what work continues after the first payment?',
    moneyExample: "An offer has an attractive first payment but needs setup, travel and ongoing replies. Compare everything you would be agreeing to with a smaller version you could finish first. Keep hoped-for income separate from money that is confirmed.",
    moneyWatch: 'starting several appealing commitments before one has a dependable way to finish',
    yearQuestion: 'Which possibility is worth a small test, and which can stay on the ideas list?',
    yearStep: 'Choose one new possibility. Try a small version before adding a second plan.',
    connection: 'Choose one new experience together. Discuss the time and effort it needs, so the invitation stays enjoyable for both people.',
  },
  '正財': {
    incomeStyle: "keeping regular promises manageable and making work that needs doing again each week visible",
    payQuestion: 'What repeats each week, and what changes if the regular workload grows?',
    moneyExample: 'A job adds weekly stock checks and training, but the pay stays the same. Put those duties beside the original role. A dependable arrangement can still need new terms when the regular work changes.',
    moneyWatch: "accepting another small regular cost or duty without looking at the total",
    yearQuestion: 'Which steady promise still supports my life, and which routine needs updating?',
    yearStep: 'Review one recurring plan. Keep the part that works and discuss the part that has grown.',
    connection: 'Choose a small promise both people can keep. Let dependable everyday actions carry more weight than a grand plan.',
  },
  '偏官': {
    incomeStyle: 'handling a demanding task with authority, support and limits that match the responsibility',
    payQuestion: "What support, permission to make decisions and agreed time come with the urgent work?",
    moneyExample: 'A role offers more money but also more urgent requests. Ask which deadlines are real, who can share the work and what happens when requests compete. Compare the full responsibility with the support being offered.',
    moneyWatch: 'treating every extra request as an emergency you must absorb',
    yearQuestion: 'Which responsibility truly needs action, and which pressure needs a clearer limit?',
    yearStep: 'Choose one demanding responsibility. Separate its real deadline from the pressure to answer everything at once.',
    connection: 'Before taking charge of a shared problem, ask whether the other person wants a decision, practical help or time to talk.',
  },
  '正官': {
    incomeStyle: "meeting a clear standard without letting an agreed role grow through things people expect but have not said",
    payQuestion: 'Who decides when the work is complete, and how will added responsibilities be discussed?',
    moneyExample: 'You meet the agreed standard, then add more checks because you want to be dependable. Compare the extra work with what was actually requested. Ask which checks matter before carrying the whole standard alone.',
    moneyWatch: 'adding unpaid effort to meet a standard that nobody has clearly agreed',
    yearQuestion: 'Which expectation have I chosen, and which one have I accepted without discussing it?',
    yearStep: 'Write down one expectation in plain words. Check whether the people involved understand it in the same way.',
    connection: 'Say what you hope for in a shared plan. Give the other person a chance to agree, adjust it or suggest something else.',
  },
  '偏印': {
    incomeStyle: 'using specialised knowledge before paying for another round of preparation',
    payQuestion: 'What practical result is needed, and when will we review whether the research is useful?',
    moneyExample: 'A new course or tool seems like the missing piece. Before adding a cost, make a small demonstration with what you already know. The result can show whether the next purchase addresses a real gap.',
    moneyWatch: 'buying or researching more preparation before trying a usable first version',
    yearQuestion: 'What have I thought about enough to try in a small, real way?',
    yearStep: 'Use one idea you already understand. Let a small result tell you what you still need to learn.',
    connection: 'Ask for quiet time when you need it, and name when you will reconnect. Space is easier to understand when it comes with an update.',
  },
  '正印': {
    incomeStyle: 'making teaching, guidance and ongoing support visible parts of the work',
    payQuestion: 'How much training or follow-up is included, and when does the other person take the next step?',
    moneyExample: 'You finish the main task but keep answering questions afterwards. Record the support you are providing. Agree a handover and a review point so a helpful explanation does not become an endless extra role.',
    moneyWatch: 'providing ongoing support without agreeing when the other person will take over',
    yearQuestion: 'What support helps me take a step, and what can I now try for myself?',
    yearStep: 'Ask for one useful explanation, then use it to complete a small step yourself.',
    connection: 'Ask whether reassurance, a suggestion or quiet company would help. Let care include room for the other person to choose.',
  },
}
LIFE_FOCUS['七殺'] = LIFE_FOCUS['偏官']

export const CLOSENESS_PROMPTS: Record<string, string> = {
  '子': 'Make time for a short check-in before choosing the plan. Ask what each person is in the mood for today.',
  '丑': 'Choose a simple plan you can both keep, such as a familiar walk or coffee. Agree the time and follow through.',
  '寅': 'Each person suggests one new activity. Choose together rather than letting the faster answer decide for both of you.',
  '卯': 'Make a clear, kind invitation. Say what you would enjoy and leave room for an honest yes, no or another idea.',
  '辰': 'Share the planning of a date or evening. Let each person choose one part instead of leaving all the arranging to one person.',
  '巳': 'Choose a little uninterrupted time together. Share one feeling you are ready to explain, without demanding the whole story at once.',
  '午': 'Plan some warm time together and keep a little time for separate interests. Say when you will reconnect.',
  '未': 'Ask about the best and hardest part of the day. Listen first, then ask whether a suggestion would be welcome.',
  '申': 'Before planning a solution, ask how the situation felt. Follow the answer with one small act of care the person actually wants.',
  '酉': 'Let each person name one detail that would make a shared plan special. Include something that matters to both of you.',
  '戌': 'Choose one small promise for the week and keep it. A short, honest update matters if the plan needs to change.',
  '亥': 'Leave a calm moment to share a feeling without demanding an immediate answer. Agree when you would like to return to the conversation.',
}
