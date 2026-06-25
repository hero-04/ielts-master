import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from speaking.models import SpeakingTest, SpeakingQuestion

DATA = [
    {
        "cambridge_book": 10,
        "test_number": 1,
        "part1": [
            "Do you work or are you a student?",
            "What subjects are you studying?",
            "Why did you choose to study that subject?",
            "What do you like about your studies?",
            "What do you dislike about your studies?",
            "Please describe your hometown a little.",
            "Is that a big city or a small place?",
            "How long have you been living there?",
            "Would you like to live in the countryside in the future?",
            "What is the difference between living in the countryside and the city?",
            "Can you describe the place where you live?",
            "What kind of housing accommodation do you live in?",
            "Do you prefer living in a house or a flat?",
            "Do you like modern art or traditional art?",
            "Have you ever visited an art gallery?",
            "What do you usually do during a break?",
            "How often do you take a break?",
            "Do you take a nap when you have a rest?",
            "Do you like quiet or noisy places?",
            "Would you like to go to quiet or noisy places on weekends?",
        ],
        "part2_q": "Describe a place with a lot of trees that you would like to visit (for example, forest, oasis).\n\nYou should say:\n• what place it is and where it is\n• how you know about it\n• why you want to go there\n• what it is like",
        "part2_a": "One place I'd love to visit is the Black Forest in Germany. I first heard about it in a geography class and was immediately drawn to the idea of wandering through endless dark pine trees. I want to go there because I find dense forests incredibly peaceful and restorative — the idea of being surrounded by towering trees with very little noise except birdsong and wind appeals deeply to me. The Black Forest is also famous for its picturesque villages and traditional culture, so it combines natural beauty with cultural interest. I imagine it would feel almost magical, especially in autumn when the leaves change colour.",
        "part3": [
            "Why do people like visiting places with trees or forests?",
            "Why is it important to have parks in the city?",
            "What benefits can a park bring to a city?",
            "Are natural views better than city views?",
            "Do all people need some nature in their lives?",
            "Are people hard-wired to protect the environment?",
            "Should the government invest more in maintaining public parks?",
            "How has urbanisation affected access to green spaces?",
        ],
    },
    {
        "cambridge_book": 10,
        "test_number": 2,
        "part1": [
            "Do you have any hobbies?",
            "Did you have any hobbies when you were a child?",
            "Do you have the same hobbies as your family members?",
            "What kinds of food do you particularly like?",
            "Is there any food you don't like?",
            "What kind of food did you like when you were young?",
            "Do you like reading?",
            "What books do you like to read?",
            "Do you prefer to read on paper or on a screen?",
            "Do you remember your dreams when you wake up?",
            "Do you think dreams have special meanings?",
            "Do you like hearing other people's dreams?",
            "What do you and your friends do together?",
            "Do you prefer to spend time with one friend or with a group of friends?",
            "Is there a difference between where you meet friends now and in the past?",
            "Have you ever borrowed books from others?",
            "Do you like to lend things to others?",
            "How do you feel when people don't return things they borrowed from you?",
            "Do you walk a lot?",
            "Why do people like to walk in parks?",
        ],
        "part2_q": "Describe a friend of yours who is good at singing or music.\n\nYou should say:\n• who this person is\n• where or when you listen to their singing or music\n• what kind of songs this person likes\n• how you feel when listening to their singing or music",
        "part2_a": "I'd like to talk about my close friend Kamron, who has a remarkable talent for singing. I've known him since secondary school and he has always had an incredible voice — rich, warm, and effortlessly on pitch. He mainly enjoys classical Uzbek music and traditional folk songs, but he can also sing modern pop songs convincingly. I usually hear him sing at family gatherings and special events. Whenever I listen to him, I feel a deep sense of pride and also a little envy! His singing has this ability to make everyone in the room go quiet and just listen. It's genuinely moving.",
        "part3": [
            "Should every child learn to play a musical instrument?",
            "What are the benefits of children learning a musical instrument?",
            "What kinds of music do people like at different ages?",
            "Do you think music lessons are important at school?",
            "Is it necessary for the government to require all children to learn music?",
            "What kinds of music are most popular in your country?",
            "Do you think music can influence people's emotions?",
            "How has technology changed the way people listen to music?",
        ],
    },
    {
        "cambridge_book": 11,
        "test_number": 1,
        "part1": [
            "What's your favourite animal?",
            "Have you ever had a pet?",
            "Where do you prefer to keep your pet, indoors or outdoors?",
            "When was the last time you had a few days off?",
            "What do you do when you have days off?",
            "What would you like to do if you had a day off tomorrow?",
            "Do you like to get up early?",
            "What is your morning routine?",
            "Do you spend your mornings doing the same things on weekdays and weekends?",
            "Have you ever been part of a sports team?",
            "Are team sports popular in your culture?",
            "What are the differences between team sports and individual sports?",
            "Do you type on a keyboard every day?",
            "When did you learn how to type on a keyboard?",
            "Do you take photos of buildings?",
            "Is there a building that you would like to visit?",
            "Do you like taking pictures of different views?",
            "Do you prefer views in urban areas or rural areas?",
            "What did you enjoy doing as a child?",
            "Did you prefer to do activities alone or with a group when you were a child?",
        ],
        "part2_q": "Describe a good friend who is important to you.\n\nYou should say:\n• who this person is and how long you've known each other\n• how you met each other\n• what you do together\n• explain why he or she is important to you",
        "part2_a": "The friend I want to describe is my best friend Dilnoza, whom I've known for almost ten years. We met on the first day of university when we happened to sit next to each other in an introductory lecture, and we instantly clicked because we had similar interests in literature and travel. Over the years we have done so many things together — exploring new restaurants, travelling to different cities, and simply talking for hours about life and our dreams. What makes Dilnoza particularly important to me is her honesty. She always tells me the truth even when it's hard to hear, and she gives genuinely thoughtful advice. I honestly can't imagine my life without her.",
        "part3": [
            "Do you think it is better for children to have a few close friends or many casual friends?",
            "Can a child's relationship with friends replace that with parents or family?",
            "Is it possible for managers to be friends with their workers?",
            "How do children make friends at school?",
            "What are the differences between friends made inside and outside the workplace?",
            "How do children make friends when they are not at school?",
            "Do you think friendships change as people get older?",
            "Is social media helpful or harmful for maintaining friendships?",
        ],
    },
]


def run():
    created_tests = 0
    created_questions = 0

    for entry in DATA:
        test, created = SpeakingTest.objects.get_or_create(
            cambridge_book=entry["cambridge_book"],
            test_number=entry["test_number"],
        )
        if created:
            created_tests += 1
            print(f"Created test: Cambridge {entry['cambridge_book']} Test {entry['test_number']}")
        else:
            print(f"Already exists: Cambridge {entry['cambridge_book']} Test {entry['test_number']} — skipping")
            continue

        for i, q_text in enumerate(entry["part1"], start=1):
            SpeakingQuestion.objects.create(
                test=test, part=1, order_number=i,
                question_text=q_text, sample_answer=""
            )
            created_questions += 1

        SpeakingQuestion.objects.create(
            test=test, part=2, order_number=1,
            question_text=entry["part2_q"],
            sample_answer=entry["part2_a"]
        )
        created_questions += 1

        for i, q_text in enumerate(entry["part3"], start=1):
            SpeakingQuestion.objects.create(
                test=test, part=3, order_number=i,
                question_text=q_text, sample_answer=""
            )
            created_questions += 1

    print(f"\nDone! Created {created_tests} tests and {created_questions} questions.")


run()
