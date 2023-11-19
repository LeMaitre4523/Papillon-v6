//
//  systemMediumCourseWidget.swift
//  PapillonWidgetExtension
//
//  Created by Tom Theret on 16/10/2023.
//

import SwiftUI

struct systemMediumCourseWidget: View {
  
  let currentDate = Date()

  var entry : CourseWidgetProvider.Entry

  var currentCourse: Course? {
    if let sharedCourses = retrieveSharedData() {
      // Convertissez la date actuelle en un timestamp en millisecondes si nécessaire
      let currentTimestamp = currentDate.timeIntervalSince1970 * 1000

      // Filtrer les cours qui ont commencé et ne sont pas encore terminés
      return sharedCourses.first { course in
         return currentTimestamp >= course.start && currentTimestamp <= course.end
      }
    }
    return nil
  }
  
  var body: some View {
    GeometryReader { reader in
      VStack(spacing: 0) {
        let upcomingCourses = entry.courses.filter { course in
          return currentDate.timeIntervalSince1970 * 1000 < course.start
        }
        //S'il y a un cours en cours
        if let currentCourse = currentCourse {
          ZStack {
            Color(hex: currentCourse.backgroundColor)
            VStack {
              HStack {
                Circle()
                  .strokeBorder(Color.white.opacity(0.5), lineWidth: 3)
                  .background(Circle().fill(Color.white.opacity(0.2)))
                  .frame(width: 40, height: 40, alignment: .center)
                  .overlay(
                    Text(currentCourse.emoji)
                  )
                VStack(alignment: .leading) {
                  Text(currentCourse.subject)
                    .font(.system(.headline, design: .rounded))
                  if currentCourse.isCancelled == true {
                    Text("Annulé")
                      .font(.system(.subheadline, design: .rounded))
                      .foregroundStyle(Color.white.opacity(0.5))
                  } else {
                    Text("salle \(currentCourse.room)")
                      .font(.system(.subheadline, design: .rounded))
                      .foregroundStyle(Color.white.opacity(0.5))
                  }
                }
                Spacer()
                VStack(alignment: .trailing){
                  Text("\(formattedTime(currentCourse.start))")
                    .font(.system(.headline, design: .rounded))
                  Text("Maintenant")
                    .font(.system(.subheadline, design: .rounded))
                    .foregroundStyle(Color.white.opacity(0.5))
                }
              }
              .padding(.horizontal)
              .lineLimit(1)
              .foregroundStyle(.white)
            }
          }
          .frame(height: 60)
          // S'il reste au moins un cours
          if !upcomingCourses.isEmpty {
            ForEach(upcomingCourses.prefix(2), id: \.id) { course in
              VStack {
                HStack {
                  Circle()
                    .strokeBorder(Color.white.opacity(0), lineWidth: 3)
                    .background(Circle().fill(Color.white.opacity(0)))
                    .frame(width: 40, height: 40, alignment: .center)
                    .overlay(
                      Text(course.emoji)
                    )
                  Text(course.subject)
                    .foregroundStyle(Color(hex: course.backgroundColor))
                    .lineLimit(1)
                    .font(.system(.headline, design: .rounded))
                  Spacer()
                  if course.isCancelled == true {
                    Text("Annulé")
                      .font(.system(.headline, design: .rounded))
                      .foregroundStyle(Color.black.opacity(0.5))
                  } else {
                    Text("\(formattedTime(course.start))")
                      .font(.system(.headline, design: .rounded))
                      .foregroundStyle(Color.primary.opacity(0.5))
                  }
                }
                .padding(.horizontal)
              }
              .frame(height: (reader.size.height - 60) * 0.5)
              .overlay(
                Rectangle()
                  .frame(height: 0.5)
                  .foregroundColor(.secondary),
                alignment: .bottom
              )
            }
          }
        } 
        // S'il reste au moins un cours suivant
        else if !upcomingCourses.isEmpty {
          ZStack {
            Color(hex: upcomingCourses.first!.backgroundColor)
            VStack {
              HStack {
                Circle()
                  .strokeBorder(Color.white.opacity(0.5), lineWidth: 3)
                  .background(Circle().fill(Color.white.opacity(0.2)))
                  .frame(width: 40, height: 40, alignment: .center)
                  .overlay(
                    Text(upcomingCourses.first!.emoji)
                  )
                VStack(alignment: .leading) {
                  Text(upcomingCourses.first!.subject)
                    .font(.headline)
                  if upcomingCourses.first!.isCancelled == true {
                    Text("Annulé")
                      .font(.system(.subheadline, design: .rounded))
                      .foregroundStyle(Color.white.opacity(0.5))
                  } else {
                    Text("salle \(upcomingCourses.first!.room)")
                      .font(.system(.subheadline, design: .rounded))
                      .foregroundStyle(Color.white.opacity(0.5))
                  }
                }
                Spacer()
                VStack(alignment: .trailing){
                  Text("\(formattedTime(upcomingCourses.first!.start))")
                    .font(.system(.headline, design: .rounded))
                }
              }
              .padding(.horizontal)
              .lineLimit(1)
              .foregroundStyle(.white)
            }
          }
           .frame(height: 60)
            //S'il reste au moins un cours
            if !upcomingCourses.isEmpty {
              ForEach(upcomingCourses.dropFirst(1).prefix(2), id: \.id) { course in
                VStack {
                  HStack {
                    Circle()
                      .strokeBorder(Color.white.opacity(0), lineWidth: 2)
                      .background(Circle().fill(Color.white.opacity(0)))
                      .frame(width: 40, height: 40, alignment: .center)
                      .overlay(
                        Text(course.emoji)
                      )
                    Text(course.subject)
                      .lineLimit(1)
                      .font(.system(.headline, design: .rounded))
                    Spacer()
                    if course.isCancelled == true {
                      Text("Annulé")
                        .font(.system(.headline, design: .rounded))
                        .foregroundStyle(Color.black.opacity(0.5))
                    } else {
                      Text("\(formattedTime(course.start))")
                        .font(.system(.headline, design: .rounded))
                        .foregroundStyle(Color.primary.opacity(0.5))
                    }
                  }.padding(.horizontal)
                }.frame(height: (reader.size.height - 60) * 0.5)
                  .overlay(
                    Rectangle()
                      .frame(height: 0.5)
                      .foregroundColor(.secondary),
                    alignment: .bottom
                  )
              }
            }
          }
          // S'il y a plus rien
          else {
            ZStack {
              Color("WidgetBackground")
              VStack {
                HStack {
                  Circle()
                    .strokeBorder(Color.white.opacity(0.5), lineWidth: 2)
                    .background(Circle().fill(Color.white.opacity(0.2)))
                    .frame(width: 40, height: 40, alignment: .center)
                    .overlay(
                      Text("😴")
                    )
                  VStack(alignment: .leading) {
                    Text("Plus de cours pour aujourd'hui")
                      .font(.system(.headline, design: .rounded))
                    Text("Repose-toi bien !")
                      .font(.system(.subheadline, design: .rounded))
                      .foregroundStyle(Color.white.opacity(0.5))
                  }
                  Spacer()
                }
                .padding(.horizontal)
                .lineLimit(1)
                .foregroundStyle(.white)
              }
            }.frame(maxHeight: 60)
            Spacer()
          }
        }
      }
    }
}
